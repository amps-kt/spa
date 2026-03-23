# Scoped data objects

Our data objects currently take a raw `DB` (PrismaClient) in their constructor. This means they can't participate in transactions and whenever we need transactional writes we have to drop down to using `db.$transaction` in our procedures (bad) or write standalone functions in `@/db/transactions/*` (worse). This leads to transaction logic living far away from the data object it operates on, and DB client details leaking away from the data access layer.

The fix is a new `Scope` abstraction (idk if there's a proper name for this) that wraps a database client (either the root PrismaClient or a transaction client) and tracks whether we're inside a transaction. Data objects receive a `Scope` instead of a raw `DB`, and all their database access goes through `this.sc.db`. This means a DO's methods automatically use whatever client the scope holds.

## Scope

```ts
const sc = new Scope(db); // root scope, not in a transaction

await sc.transaction(async (tx) => {
  // tx is a new Scope bound to the transaction client
  // any data object created with tx uses the transaction
  const project = new Project(tx, params);
  await project.update({ ... });
  await project.linkFlags(flagIds);
  // all queries here are atomic
});
```

The coolest thing is that if a scope is already inside a transaction, calling `scope.transaction(...)` just runs the callback directly, it won't try to nest the transaction (which I don't think is possible). So data object methods can call `this.sc.transaction(...)` without worrying about whether their caller already started one.

There's also a `scope.batch(queries)` for the non-interactive transaction style `$transaction([...])` with the same nesting behaviour.

You can find the full implementation in [scope.ts](src/server/scope.ts).

## ScopedDataObject

`ScopedDataObject` is the new base class that replaces `DataObject`. The only difference is it takes a `Scope` instead of a `DB`:

```ts
// before
class Project extends DataObject {
  constructor(db: DB, params: ProjectParams) {
    super(db);
  }
  // this.db is a raw PrismaClient - can't be a transaction client
}

// after
class Project extends ScopedDataObject {
  constructor(scope: Scope, params: ProjectParams) {
    super(scope);
  }
  // this.sc.db is whatever client the scope holds (DB or TX)
}
```

## What this lets us do

What I suspect will make you the happiest is that the standalone transaction helpers in `@/db/transactions/*` can now just become methods on the data object and that file can die. We had to keep them as standalone helpers because a data object didn't have access to a transaction client but now it does, through its scope.

For example, `linkProjectFlagIds(tx, params, flagIds)` from `@/db/transactions/project-flags.ts` becomes `project.linkFlags(flagIds)`. The method uses `this.sc.db` internally, so if the project was created inside a `scope.transaction(...)` callback, the write is part of that transaction automatically.

Before (procedure had to orchestrate raw tx calls):
```ts
await db.$transaction(async (tx) => {
  await tx.project.update({ where: ..., data: { ... } });
  await linkProjectFlagIds(tx, project.params, flagIds);
  await linkProjectTagIds(tx, project.params, tagIds);
  await linkPreAllocatedStudent(tx, project.params, studentId);
});
```

After (procedure talks to data objects, transactions are scoped):
```ts
await sc.transaction(async (tx) => {
  const txProject = new Project(tx, project.params);
  await txProject.update({ ... });
  await txProject.linkFlags(flagIds);
  await txProject.linkTags(tagIds);
  await txProject.linkPreAllocatedStudent(studentId);
});
```

The router no longer needs to import standalone transaction helpers or touch Prisma directly. It just calls methods on data objects. Though the next PR will be moving this away from the procedures.

I've migrated [Project](src/data-objects/project.ts) as the first example and updated the [project router](src/server/routers/project.ts) to use it. The old version is kept in [project.old.ts](src/data-objects/project.old.ts) for reference during migration.
