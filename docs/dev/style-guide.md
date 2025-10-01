# Style guide

## Destructing

In async functions, you should destructure values before returning them. For example, do this:

> [!tip] OK:
>
> ```ts
> const { displayName } = await instance.get();
> return displayName;
> ```

Not this:

> [!tip] BAD:
>
> ```ts
> return (await instance.get()).displayName;
> ```

You don't have to do this if you don't need the await. For example:

> [!tip] OK:
>
> ```ts
> return instance.params;
> ```

## format functions

Very often, a function falls into the category of 'retrieve re-format return'. Take this function for example:

> [!tip] OK:
>
> ```ts data-objects/spaces/instance.ts
> public async getSupervisors(): Promise<SupervisorDTO[]> {
>    const supervisors = await this.db.supervisorDetails.findMany({
>        where: expand(this.params),
>        include: { userInInstance: { include: { user: true } } },
>     });
>
>     return supervisors.map(({ userInInstance, ...s }) => ({
>         id: userInInstance.user.id,
>         name: userInInstance.user.name,
>         email: userInInstance.user.email,
>         projectTarget: s.projectAllocationTarget,
>         projectUpperQuota: s.projectAllocationUpperBound,
>     }));
> }
> ```

When doing this, always pull out the data into a constant first, and then return the transformation on it. Don't use a .then().

> [!tip] BAD:
>
> ```ts data-objects/spaces/instance.ts
> public async getSupervisors(): Promise<SupervisorDTO[]> {
> return await this.db.supervisorDetails
>     .findMany({
>     where: expand(this.params),
>     include: { userInInstance: { include: { user: true } } },
>     })
>     .then((supervisors) =>
>     supervisors.map(({ userInInstance, ...s }) => ({
>         id: userInInstance.user.id,
>         name: userInInstance.user.name,
>         email: userInInstance.user.email,
>         projectTarget: s.projectAllocationTarget,
>         projectUpperQuota: s.projectAllocationUpperBound,
>     })),
>     );
> }
> ```

## Prefetch-query pattern

```tsx Page.tsx
async function Page() {
  const initialData = await api.query_for_data();

  return <QueryManager initialData={initialData} />;
}
```

```tsx QueryManager.tsx
function QueryManager({ initialData }: { initialData: TData }) {
  const { data, ...etc } = api.query_for_data.useQuery({ initialData });

  // rest of component, presumably consuming `data`

  return <div>{data}</div>;
}
```
