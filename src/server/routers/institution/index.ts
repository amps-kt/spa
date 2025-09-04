import { z } from "zod";

import { groupDtoSchema, userDtoSchema } from "@/dto";

import { procedure } from "@/server/middleware";
import { createTRPCRouter } from "@/server/trpc";

import { groupRouter } from "./group";
import { instanceRouter } from "./instance";
import { subGroupRouter } from "./sub-group";

export const institutionRouter = createTRPCRouter({
  group: groupRouter,
  subGroup: subGroupRouter,
  instance: instanceRouter,

  // Move to user router
  isSuperAdmin: procedure.user
    .output(z.boolean())
    .query(async ({ ctx: { user } }) => await user.isSuperAdmin()),

  getAllSuperAdmins: procedure.superAdmin
    .output(z.array(userDtoSchema))
    .query(async ({ ctx: { institution } }) => await institution.getAdmins()),

  // Move below to group router
  getAllGroups: procedure.superAdmin
    .output(z.array(groupDtoSchema))
    .query(async ({ ctx: { institution } }) => await institution.getGroups()),

  getTakenGroupNames: procedure.superAdmin
    .output(z.set(z.string()))
    .query(
      async ({ ctx: { institution } }) =>
        new Set((await institution.getGroups()).map((x) => x.displayName)),
    ),

  createGroup: procedure.superAdmin
    .input(z.object({ groupName: z.string() }))
    .output(groupDtoSchema)
    .mutation(async ({ ctx: { institution, audit }, input: { groupName } }) => {
      audit("created group", { group: groupName });
      return await institution.createGroup(groupName);
    }),

  deleteGroup: procedure.group.superAdmin
    .output(z.void())
    .mutation(async ({ ctx: { group, audit } }) => {
      audit("deleted group", group.params);
      await group.delete();
    }),

  getAllUsers: procedure.superAdmin
    .output(z.array(userDtoSchema))
    .query(async ({ ctx: { institution } }) => institution.getUsers()),

  getDetailsForUser: procedure.superAdmin
    .input(z.object({ userId: z.string() }))
    .output(z.object({ user: userDtoSchema, isSuperAdmin: z.boolean() }))
    .query(async ({ ctx: { institution }, input: { userId } }) => {
      const user = institution.getUserObjectById(userId);

      return {
        user: await user.toDTO(),
        isSuperAdmin: await user.isSuperAdmin(),
      };
    }),

  createUser: procedure.superAdmin
    .input(z.object({ user: userDtoSchema }))
    .output(userDtoSchema)
    .mutation(async ({ ctx: { institution, audit }, input: { user } }) => {
      audit("created user", { user });
      return await institution.createUser(user);
    }),

  updateUser: procedure.superAdmin
    .input(z.object({ user: userDtoSchema }))
    .output(userDtoSchema)
    .mutation(async ({ ctx: { institution, audit }, input: { user } }) => {
      audit("updating user", { user });
      return await institution.updateUser(user);
    }),
});
