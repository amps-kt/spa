## Architecture

The SPA system is comprised of two main repositories:

The first is the matching service

This is a flask (python) app which simply serves out a series of pre-defined algorithms.
All of the difficult logic being handled by libraries like networkx or matchingproblems.
As the name implies, it is used to handle matching problems, and only needs to be updated if there are new matching algorithms to add.

---

The second repository (this one) is a nextJS application which handles all the CRUD

We broadly follow the T3 stack and architecture;
more details can be found on [the t3 website](https://create.t3.gg/en/folder-structure-app?packages=prisma%2Ctailwind%2Ctrpc).
This link has the correct packages already selected.

The main components within this are:

- the database schema,

  - We use [prisma](https://www.prisma.io/) as our ORM
  - contained in `/prisma`

- the backend,

  - We use [tRPC](https://trpc.io/)
  - contained in `/stc/router...`
  - Most of the logic in the procedures in reality lives in data objects ([see below](#data-objects))

- the frontend,
  - A set of [React](https://react.dev/) components, one for each page (see [NextJS](https://nextjs.org/))
  - contained in `/src/app`
  - This is the display layer; in general, very little business logic lives here.
    Anything here can run on the client, so critical information needs to be controlled and restricted so

Some other critical dependencies:

- [Tailwind](https://tailwindcss.com/) for styling
- [Zod](https://tailwindcss.com/) for runtime data validation
- [ShadCN UI](https://ui.shadcn.com/) for many common UI tasks

Still, there are a few quirks unique to this application that we hand-rolled, which I will discuss in some more detail:

### Data objects

Previously, database calls were all done in the top level of procedures.
There were several issues with this - a big one being that it was difficult to re-use code.

This has been refactored, and we now use a system of data objects. These can be found in `/src/data-objects/`.

The idea is to organise functions by the objects they refer to; business logic related to a kind of object is encapsulated in the corresponding data object.

It's driven lots of very nice patterns; for instance, the authentication middleware we use is only possible because of this design.

In reality, the data objects are sometimes a bit messy; significant parts are not very well organised, and need cleaning up.
Maybe one day we will get around to it, but it hasn't been a priority.
We aim to remove all database calls from the tRPC procedures, and instead concentrate them in the data objects.

Generally, you will not need to import these directly; the relevant objects will be injected into the tRPC by the middleware.

### tRPC middlewares

We use a custom set of middlewares for tRPC.
These need to change very rarely.

The main idea is to abstract away a lot of the tedious boilerplate that is present in many procedures.

If you wanted, for example, to write a procedure which updates an allocation instance, then you would need to
accept the parameters which specify the instance (it's ID, essentially) and then query the database based on these.

Any procedure pertaining to an instance has to do this, and so we can save a lot of work by abstracting it away. This is what a middleware does. It adds the necessary input parameters and injects objects into the tRPC context.

We also have authentication middlewares - which automatically check that the user has the correct authorisation and inject a corresponding user object. If authentication fails, the procedure will error. Generally, you should try to make sure that your procedures are properly scoped wrt authorisation - it's critical to avoid accidental data leaks.

### Data transfer objects

There are many places in the application where _almost_ the same data is required, though it may differ slightly.
Creating types for each individual use case proved very messy; there were lots of interfaces floating around that were used only once,
and it made knowing what data was on each hard to track.
Now, instead, for each type of object there is a single type that contains all the data for that object type,
and we always pass around the full objects.

These large canonical types are called Data Transfer Objects (DTOs).

If you are presenting data relating to e.g. a student, you can use the `StudentDTO` type,
rather than having to carefully hand-craft the type for what you need.
Whilst this is a little less efficient - you may end up passing around data you don't strictly need - the benefits to code style and legibility are substantial.
It makes moving around different parts of the application much easier, since the types are always the same.

---

## Deployment

The matching service and the allocation app are each packaged into a docker image.
We use docker compose to orchestrate them, along with
Some extra details need to be provided via environment variables.

See \that\file for details of which ones are needed and what they should be.
