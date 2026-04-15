# Middleware refactor

As we know our current middleware cannot handle the level of granularity we want for checking permissions on certain actions, because it was designed for much simpler RBAC. This new middleware aims to solve parts of that problem by allowing us to perform arbitrary checks after some of our existing middleware checkes, but before the actual procedure body. This way the procedure body can just focus on orchestrating services, the way God intended.

The main mechanism is a new middleware which takes a predicate and checks that the predicate holds. If the predicate returns false the middleware throws an `Unauthorised` error. 

```ts
// A guard takes a predicate and rejects the request if it returns false
procedure.instance.user
  .use(
    instanceGuard(
      ({ user, params }) => user.isSubGroupAdminOrBetter(params),
    ),
  )
  .query(async ({ ctx }) => {
    // This only runs if the predicate passed
  })
````
A single predicate however still wouldn't allow us to do all the checks we need, but we can just use combinators!


```ts
// where `Ctx` is just the context that we make available in a middleware (so the user, db, etc.)
type GuardPredicate<TParams, TInput> = (ctx: Ctx<TParams>, input: TInput) => Promise<boolean> | boolean;

declare function anyOf(...predicates: GuardPredicate[]): GuardPredicate
declare function allOf(...predicates: GuardPredicate[]): GuardPredicate
```


You can find more details in [guard.ts](src/server/guard.ts) and I've migrated the [project router](src/server/routers/project.ts) to use the new guards as an example of how it works


This however means we're losing any sort of type narrowing on the user.


In the situation that this was made to help out with (we had to defer to manual permission checks in the procedure body) we already didn't get any type-narrowing, so it's no worse in that regard and we win a lot of readability in our procedure. So a guard like this:

```ts
anyOf(
  ({ user, params }) => user.isSubGroupAdminOrBetter(params),
  ({ user, params }) => user.isProjectSupervisor(params.projectId),
)
```

Doesn't do any type narrowing. We don't get a:
```ts
const user: SubGroupAdmin | Supervisor;
```
But again we didn't get that before anyway. For the simpler cases we can still default to using the existing role middlewares for procedure that need a narrowed user type, guards only handle the cases where we were already falling back to manual checks.
