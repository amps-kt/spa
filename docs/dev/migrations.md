# Migration docs

## Applying migrations

We only just started using the prisma migrate system, so first I'll explain how to get them working with the existing database.

The tl;dr for what you have to do is:

1. Make sure you have a good version of the database (i.e. a recent backup) e.g.

```sh
./scripts/db/restore_db.sh
```

2. We mark as resolved (_but do not apply_) a migration that represents emptySchema -> current

```sh
pnpm prisma migrate resolve --applied "20250819173117_init"
```

3. We apply the rest of the migrations to get up to date with the schema.

```sh
pnpm prisma migrate deploy
```

4. (optional) check that the database and the schema are in sync:

```sh
pnpm prisma migrate diff --from-schema-datasource ./prisma/schema --to-schema-datamodel ./prisma/schema
```

If all went well, this should output 'no difference detected'

---

## In a little more detail

First, we need to create a migration that represent's moving the database from the empty schema,
to it's current state.

You can then marked this as applied using:

```sh
pnpm prisma migrate resolve --applied <migration name>
```

So for us specifically:

```sh
pnpm prisma migrate resolve --applied "20250819173117_init"
```

Next, we need to create a migration that covers any changes. It turns out that
there has been some drift between the schema and the database.
This can be resolved by creating a new migration that applies the changes

You create such a migration with

```sh
pnpm prisma migrate dev
```

This

Finally, you can apply migrations with

```sh
pnpm prisma migrate deploy
```

---

You can inspect the difference between the two using the command:

```sh
pnpm prisma migrate diff --from-schema-datasource ./prisma/schema --to-schema-datamodel ./prisma/schema
```

Sometimes, prisma is a bit dumb in how it applies the change. For instance:

```md
[-] Removed enums

- preference_type

[+] Added enums

- student_preference_type
```

The migration will drop the first, and create the second.
but this isn't what we want - that operation would be destructive.
Instead, we need to rename the preference_type enum to student_preference_type.
To do this, you should run

```sh
pnpm prisma migrate dev --create-only
```

This will create the migration file, but not apply it.
You can then go in and manually edit the migration so that it has the behaviour you want.
You can then apply it with

```sh
pnpm prisma migrate deploy
```

And then check to see if the models match with

```sh
pnpm prisma migrate diff --from-schema-datasource ./prisma/schema --to-schema-datamodel ./prisma/schema
```

If you did it correctly, there should be no differences between the database and the schema.
