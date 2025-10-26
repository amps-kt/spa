import { env } from "@/env";
import { z } from "zod";

import { PAGES } from "@/config/pages";

import {
  flagDtoSchema,
  instanceDtoSchema,
  ProjectAllocationStatus,
  projectDtoSchema,
  projectStatusRank as statusRank,
  readerDtoSchema,
  studentDtoSchema,
  supervisorDtoSchema,
  tagDtoSchema,
  unitOfAssessmentDtoSchema,
} from "@/dto";
import {
  LinkUserResult,
  LinkUserResultSchema,
} from "@/dto/result/link-user-result";
import {
  ReaderAssignmentResult,
  readerAssignmentResultSchema,
} from "@/dto/result/reader-allocation-result";

import { AllocationInstance } from "@/data-objects";

import { Transformers as T } from "@/db/transformers";
import {
  AllocationMethod,
  extendedReaderPreferenceTypeSchema,
  allocationMethodSchema,
  PreferenceType,
  Role,
  Stage,
} from "@/db/types";
import { stageSchema } from "@/db/types";

import { procedure } from "@/server/middleware";
import { createTRPCRouter } from "@/server/trpc";

import { HttpReaderAllocator } from "@/lib/services/reader-allocation/http-reader-allocator";
import {
  matchingOutputSchema,
  matchingReaderSchema,
} from "@/lib/services/reader-allocation/types";
import { formatParamsAsPath } from "@/lib/utils/general/get-instance-path";
import { expand } from "@/lib/utils/general/instance-params";
import { previousStages } from "@/lib/utils/permissions/stage-check";
import { newReaderAllocationSchema } from "@/lib/validations/allocate-readers/new-reader-allocation";
import { projectPreferenceCardDtoSchema } from "@/lib/validations/board";
import { instanceParamsSchema } from "@/lib/validations/params";
import {
  convertPreferenceType,
  studentPreferenceSchema,
} from "@/lib/validations/student-preference";
import { tabGroupSchema } from "@/lib/validations/tabs";

import { algorithmRouter } from "./algorithm";
import { matchingRouter } from "./matching";
import { preferenceRouter } from "./preference";

// TODO: add stage checks to stage-specific procedures
export const instanceRouter = createTRPCRouter({
  matching: matchingRouter,
  algorithm: algorithmRouter,
  preference: preferenceRouter,

  /**
   * Check if an instance exists by ID
   */
  exists: procedure.instance.user
    .output(z.boolean())
    .query(async ({ ctx: { instance } }) => await instance.exists()),

  /**
   * Get instance data by ID
   * @throws if the instance doesn't exist
   */
  get: procedure.instance.member
    .output(instanceDtoSchema)
    .query(async ({ ctx: { instance } }) => await instance.get()),

  edit: procedure.instance.subGroupAdmin
    .input(
      z.object({
        updatedInstance: instanceDtoSchema.omit({
          stage: true,
          supervisorAllocationAccess: true,
          studentAllocationAccess: true,
        }),
        flags: z.array(flagDtoSchema),
        tags: z.array(tagDtoSchema.omit({ id: true })),
      }),
    )
    .output(z.void())
    .mutation(
      async ({
        ctx: { instance, audit },
        input: { updatedInstance, flags, tags },
      }) => {
        audit("Instance Updated", { data: { updatedInstance, flags, tags } });
        return await instance.edit({ flags, tags, instance: updatedInstance });
      },
    ),

  /**
   * Returns the current stage of an instance with the ID provided
   * @throws if the instance doesn't exist
   */
  getCurrentStage: procedure.instance.user
    .output(stageSchema)
    .query(async ({ ctx: { instance } }) => {
      const { stage } = await instance.get();
      return stage;
    }),

  /**
   * Set the current stage for the specified instance
   */
  setStage: procedure.instance.subGroupAdmin
    .input(z.object({ stage: stageSchema }))
    .output(z.void())
    .mutation(async ({ ctx: { instance, audit }, input: { stage } }) => {
      audit("Changed instance stage", { setTo: stage });
      return await instance.setStage(stage);
    }),

  /**
   * Returns the ID and display name of the currently selected algorithm
   * return empty strings if none is selected
   */
  getSelectedAlgorithm: procedure.instance.subGroupAdmin
    .output(z.object({ id: z.string(), displayName: z.string() }).optional())
    .query(async ({ ctx: { instance } }) => {
      const alg = await instance.getSelectedAlg();

      if (!alg) return undefined;

      const { id, displayName } = await alg.get();
      return { id, displayName };
    }),

  setSelectedAlgorithm: procedure.instance.subGroupAdmin
    .input(z.object({ algId: z.string() }))
    .output(z.void())
    .mutation(async ({ ctx: { instance, audit }, input: { algId } }) => {
      audit("Set selected algorithm", { algId });
      return await instance.selectAlg(algId);
    }),

  // TODO do we have this schema (or parts of it) elsewhere?
  /**
   * return the allocations in this instance, in three views:
   * by student, by supervisor, and by project
   */
  projectAllocations: procedure.instance.subGroupAdmin
    .output(
      z.object({
        byStudent: z.array(
          z.object({
            student: z.object({
              id: z.string(),
              name: z.string(),
              email: z.string(),
              ranking: z.number(),
            }),
            project: z.object({ id: z.string(), title: z.string() }),
            supervisor: z.object({ id: z.string(), name: z.string() }),
          }),
        ),
        byProject: z.array(
          z.object({
            project: z.object({
              id: z.string(),
              title: z.string(),
              capacityLowerBound: z.number(),
              capacityUpperBound: z.number(),
            }),
            supervisor: z.object({ id: z.string(), name: z.string() }),
            student: z.object({
              id: z.string(),
              name: z.string(),
              ranking: z.number(),
            }),
          }),
        ),
        bySupervisor: z.array(
          z.object({
            project: z.object({ id: z.string(), title: z.string() }),
            supervisor: z.object({
              id: z.string(),
              name: z.string(),
              email: z.string(),
              allocationLowerBound: z.number(),
              allocationTarget: z.number(),
              allocationUpperBound: z.number(),
            }),
            student: z.object({
              id: z.string(),
              name: z.string(),
              ranking: z.number(),
            }),
          }),
        ),
      }),
    )
    .query(async ({ ctx }) => {
      const allocationData = await ctx.instance.getAllocationData();
      return allocationData.getViews();
    }),

  getUsedFlags: procedure.instance.member
    .output(z.array(flagDtoSchema))
    .query(
      async ({ ctx: { instance } }) => await instance.getFlagsOnProjects(),
    ),

  getUsedTags: procedure.instance.member
    .output(z.array(tagDtoSchema))
    .query(async ({ ctx: { instance } }) => await instance.getTagsOnProjects()),

  // TODO split
  getAllProjectDescriptors: procedure.instance.member
    .output(
      z.object({ flags: z.array(flagDtoSchema), tags: z.array(tagDtoSchema) }),
    )
    .query(async ({ ctx: { instance } }) => ({
      tags: await instance.getTags(),
      flags: await instance.getFlags(),
    })),

  getFlags: procedure.instance.member
    .output(z.array(flagDtoSchema))
    .query(async ({ ctx: { instance } }) => await instance.getFlags()),

  getTags: procedure.instance.member
    .output(z.array(tagDtoSchema))
    .query(async ({ ctx: { instance } }) => await instance.getTags()),

  getAllPreviousProjects: procedure.instance.subGroupAdmin
    .output(
      z.array(
        z.object({
          project: projectDtoSchema,
          supervisor: supervisorDtoSchema,
          instanceData: instanceDtoSchema,
        }),
      ),
    )
    .query(async ({ ctx: { group } }) => await group.getAllProjects()),

  getSupervisors: procedure.instance.subGroupAdmin
    .output(z.array(supervisorDtoSchema))
    .query(async ({ ctx: { instance } }) => await instance.getSupervisors()),

  addSupervisor: procedure.instance.subGroupAdmin
    .input(z.object({ newSupervisor: supervisorDtoSchema }))
    .output(LinkUserResultSchema)
    .mutation(
      async ({
        ctx: { instance, institution, audit },
        input: { newSupervisor },
      }) => {
        if (await instance.isSupervisor(newSupervisor.id)) {
          audit("Added supervisor", {
            supervisorId: newSupervisor.id,
            result: LinkUserResult.PRE_EXISTING,
          });
          return LinkUserResult.PRE_EXISTING;
        }

        const userExists = await institution.userExists(newSupervisor.id);

        if (!userExists) await institution.createUser(newSupervisor);

        await instance.linkUser(newSupervisor);
        await instance.linkSupervisor(newSupervisor);

        if (!userExists) {
          audit("Added supervisor", {
            supervisorId: newSupervisor.id,
            result: LinkUserResult.CREATED_NEW,
          });
          return LinkUserResult.CREATED_NEW;
        } else {
          audit("Added supervisor", {
            supervisorId: newSupervisor.id,
            result: LinkUserResult.OK,
          });
          return LinkUserResult.OK;
        }
      },
    ),

  addManySupervisors: procedure.instance.subGroupAdmin
    .input(z.object({ newSupervisors: z.array(supervisorDtoSchema) }))
    .output(z.array(LinkUserResultSchema))
    .mutation(
      async ({
        ctx: { instance, institution, audit },
        input: { newSupervisors },
      }) => {
        const existingSupervisorIds = await instance
          .getSupervisors()
          .then((data) => data.map(({ id }) => id));

        const existingUserIds = await institution
          .getUsers()
          .then((data) => data.map(({ id }) => id));

        await institution.createUsers(
          newSupervisors.map((s) => ({
            id: s.id,
            name: s.name,
            email: s.email,
          })),
        );

        await instance.linkUsers(newSupervisors);

        await instance.linkManySupervisors(newSupervisors);

        const res = newSupervisors.map((s) => {
          if (existingSupervisorIds.includes(s.id)) {
            return LinkUserResult.PRE_EXISTING;
          }
          if (existingUserIds.includes(s.id)) {
            return LinkUserResult.CREATED_NEW;
          }
          return LinkUserResult.OK;
        });

        audit("Added new supervisors", { data: res });

        return res;
      },
    ),

  deleteSupervisor: procedure.instance
    .withAC({
      allowedStages: previousStages(Stage.STUDENT_BIDDING),
      allowedRoles: [Role.ADMIN],
    })
    .input(z.object({ supervisorId: z.string() }))
    .output(z.void())
    .mutation(async ({ ctx: { instance, audit }, input: { supervisorId } }) => {
      audit("Deleted supervisor", { supervisorId });
      return await instance.deleteSupervisor(supervisorId);
    }),

  deleteManySupervisors: procedure.instance
    .withAC({
      allowedStages: previousStages(Stage.STUDENT_BIDDING),
      allowedRoles: [Role.ADMIN],
    })
    .input(z.object({ supervisorIds: z.array(z.string()) }))
    .output(z.void())
    .mutation(
      async ({ ctx: { instance, audit }, input: { supervisorIds } }) => {
        audit("Deleted supervisors", { supervisorIds });
        return await instance.deleteManySupervisors(supervisorIds);
      },
    ),

  deleteUserInInstance: procedure.instance
    .withAC({
      allowedStages: previousStages(Stage.STUDENT_BIDDING),
      allowedRoles: [Role.ADMIN],
    })
    .input(z.object({ supervisorId: z.string() }))
    .output(z.void())
    .mutation(async ({ ctx: { instance, audit }, input: { supervisorId } }) => {
      audit("Deleted UserInInstance", { supervisorId });
      return await instance.unlinkUser(supervisorId);
    }),

  deleteManyUsersInInstance: procedure.instance
    .withAC({
      allowedStages: previousStages(Stage.STUDENT_BIDDING),
      allowedRoles: [Role.ADMIN],
    })
    .input(z.object({ supervisorIds: z.array(z.string()) }))
    .output(z.void())
    .mutation(
      async ({ ctx: { instance, audit }, input: { supervisorIds } }) => {
        audit("Deleted UserInInstance", { data: supervisorIds });
        return instance.unlinkUsers(supervisorIds);
      },
    ),

  getStudents: procedure.instance.subGroupAdmin
    .output(z.array(studentDtoSchema))
    .query(async ({ ctx: { instance } }) => await instance.getStudents()),

  getStudentsWithAllocation: procedure.instance.subGroupAdmin
    .output(
      z.array(
        z.object({
          student: studentDtoSchema,
          allocation: projectDtoSchema.optional(),
        }),
      ),
    )
    .query(
      async ({ ctx: { instance } }) =>
        await instance.getStudentAllocationDetails(),
    ),

  addStudent: procedure.instance.subGroupAdmin
    .input(z.object({ newStudent: studentDtoSchema }))
    .output(LinkUserResultSchema)
    .mutation(
      async ({
        ctx: { instance, institution, audit },
        input: { newStudent },
      }) => {
        if (await instance.isStudent(newStudent.id)) {
          audit("Added new student", {
            studentId: newStudent.id,
            result: LinkUserResult.PRE_EXISTING,
          });
          return LinkUserResult.PRE_EXISTING;
        }

        const userExists = await institution.userExists(newStudent.id);

        if (!userExists) await institution.createUser(newStudent);

        await instance.linkUser(newStudent);
        await instance.linkManyStudents([newStudent]);

        if (!userExists) {
          audit("Added new student", {
            studentId: newStudent.id,
            result: LinkUserResult.CREATED_NEW,
          });
          return LinkUserResult.CREATED_NEW;
        } else {
          audit("Added new student", {
            studentId: newStudent.id,
            result: LinkUserResult.OK,
          });
          return LinkUserResult.OK;
        }
      },
    ),

  addManyStudents: procedure.instance.subGroupAdmin
    .input(z.object({ newStudents: z.array(studentDtoSchema) }))
    .output(z.array(LinkUserResultSchema))
    .mutation(
      async ({
        ctx: { instance, institution, audit },
        input: { newStudents },
      }) => {
        const existingStudentIds = await instance
          .getStudents()
          .then((data) => data.map(({ id }) => id));

        const existingUserIds = await institution
          .getUsers()
          .then((data) => data.map(({ id }) => id));

        await institution.createUsers(
          newStudents.map((s) => ({ id: s.id, name: s.name, email: s.email })),
        );

        await instance.linkUsers(newStudents);

        await instance.linkManyStudents(newStudents);

        const res = newStudents.map((s) => {
          if (existingStudentIds.includes(s.id)) {
            return LinkUserResult.PRE_EXISTING;
          }
          if (existingUserIds.includes(s.id)) {
            return LinkUserResult.CREATED_NEW;
          }
          return LinkUserResult.OK;
        });

        audit("Added new students", { data: res });

        return res;
      },
    ),

  deleteStudent: procedure.instance
    .withAC({
      allowedStages: previousStages(Stage.STUDENT_BIDDING),
      allowedRoles: [Role.ADMIN],
    })
    .input(z.object({ studentId: z.string() }))
    .output(z.void())
    .mutation(async ({ ctx: { instance, audit }, input: { studentId } }) => {
      {
        audit("Deleting student", { studentId });
        return await instance.deleteStudent(studentId);
      }
    }),

  deleteManyStudents: procedure.instance
    .withAC({
      allowedStages: previousStages(Stage.STUDENT_BIDDING),
      allowedRoles: [Role.ADMIN],
    })
    .input(z.object({ studentIds: z.array(z.string()) }))
    .output(z.void())
    .mutation(async ({ ctx: { instance, audit }, input: { studentIds } }) => {
      audit("Deleting students", { data: studentIds });
      await instance.deleteManyStudents(studentIds);
    }),

  getStudentsWithPreAllocationStatus: procedure.instance.subGroupAdmin
    .output(
      z.array(
        z.object({ student: studentDtoSchema, preAllocated: z.boolean() }),
      ),
    )
    .query(async ({ ctx: { instance } }) => {
      const invitedStudents = await instance.getStudents();

      const preAllocations = await instance.getPreAllocations();
      const preAllocatedStudents = new Set(
        preAllocations.map((p) => p.project.id),
      );

      return invitedStudents.map((u) => ({
        student: u,
        preAllocated: preAllocatedStudents.has(u.id),
      }));
    }),

  updateStudentFlag: procedure.instance.subGroupAdmin
    .input(z.object({ studentId: z.string(), flagId: z.string() }))
    .output(studentDtoSchema)
    .mutation(
      async ({ ctx: { instance, audit }, input: { studentId, flagId } }) => {
        audit("Changing student flag", { studentId, flagId });
        const student = await instance.getStudent(studentId);
        return student.setStudentFlag(flagId);
      },
    ),

  // todo: standardise error reporting
  /**
   * Sub-group admin updating a student's preference over a particular project
   */
  updateStudentPreference: procedure.instance
    .withAC({
      allowedStages: [Stage.STUDENT_BIDDING],
      allowedRoles: [Role.ADMIN],
    })
    .input(
      z.object({
        studentId: z.string(),
        projectId: z.string(),
        preferenceType: studentPreferenceSchema,
      }),
    )
    .output(
      z.object({
        [PreferenceType.PREFERENCE]: z.array(projectPreferenceCardDtoSchema),
        [PreferenceType.SHORTLIST]: z.array(projectPreferenceCardDtoSchema),
      }),
    )
    .mutation(
      async ({
        ctx: { instance, audit },
        input: { studentId, projectId, preferenceType },
      }) => {
        audit("Attempting to update student preference", {
          studentId,
          projectId,
          preferenceType,
        });

        const student = await instance.getStudent(studentId);

        if (await student.hasSelfDefinedProject()) {
          audit("Student has self-defined a project, aborting update", {
            studentId,
          });
          throw new Error("Student has self-defined a project");
        }

        const newPreferenceType = convertPreferenceType(preferenceType);
        audit("Updating draft preference type", {
          studentId,
          projectId,
          newPreferenceType,
        });

        await student.updateDraftPreferenceType(projectId, newPreferenceType);

        audit("Fetching updated preference board state", { studentId });
        return await student.getPreferenceBoardState();
      },
    ),

  // ? maybe duplicate of `updateStudentPreference`
  /**
   * Sub-group admin changing a Student's preference
   */
  changeStudentPreference: procedure.instance.subGroupAdmin
    .input(
      z.object({
        studentId: z.string(),
        projectId: z.string(),
        newPreferenceType: studentPreferenceSchema,
      }),
    )
    .output(z.void())
    .mutation(
      async ({
        ctx: { instance, audit },
        input: { studentId, projectId, newPreferenceType },
      }) => {
        audit("Changing student preference", {
          studentId,
          projectId,
          newPreferenceType,
        });
        const student = await instance.getStudent(studentId);

        const preferenceType = convertPreferenceType(newPreferenceType);

        await student.updateDraftPreferenceType(projectId, preferenceType);
        audit("Student preference updated successfully", {
          studentId,
          projectId,
          newPreferenceType,
        });
      },
    ),

  /**
   * Sub-group admin changing multiple of a Student's preferences
   */
  changeManyStudentPreferences: procedure.instance.subGroupAdmin
    .input(
      z.object({
        studentId: z.string(),
        newPreferenceType: z.enum(PreferenceType).or(z.literal("None")),
        projectIds: z.array(z.string()),
      }),
    )
    .output(z.void())
    .mutation(
      async ({
        ctx: { instance, audit },
        input: { studentId, newPreferenceType, projectIds },
      }) => {
        audit("Changing student preferences for multiple projects", {
          studentId,
          newPreferenceType,
          projectIds,
        });
        const student = await instance.getStudent(studentId);
        const preferenceType = convertPreferenceType(newPreferenceType);

        await student.updateManyDraftPreferenceTypes(
          projectIds,
          preferenceType,
        );
        audit("Student preferences updated successfully", {
          studentId,
          newPreferenceType,
          projectIds,
        });
      },
    ),

  // ? maybe merge all of these into a single update
  /**
   * Sub-group admin reordering a student's preferences
   */
  reorderStudentPreference: procedure.instance
    .withAC({
      allowedStages: [Stage.STUDENT_BIDDING],
      allowedRoles: [Role.ADMIN],
    })
    .input(
      z.object({
        studentId: z.string(),
        projectId: z.string(),
        preferenceType: z.enum(PreferenceType),
        updatedRank: z.number(),
      }),
    )
    .output(z.void())
    .mutation(
      async ({
        ctx: { instance, audit },
        input: { studentId, projectId, preferenceType, updatedRank },
      }) => {
        audit("Attempting to reorder student preference", {
          studentId,
          projectId,
          preferenceType,
          updatedRank,
        });

        const student = await instance.getStudent(studentId);

        audit("Checking if student has self-defined project", { studentId });
        if (await student.hasSelfDefinedProject()) {
          audit("Student has self-defined a project, skipping reorder", {
            studentId,
          });

          return;
        }
        audit("not self-defined, checking flags");
        const { flag: studentFlag } = await student.get();
        const projectFlags = await instance.getProject(projectId).getFlags();

        if (!projectFlags.map((f) => f.id).includes(studentFlag.id)) {
          audit("Project is not suitable for student", {
            projectFlags,
            studentFlag,
          });
          return;
        }

        await student.updateDraftPreferenceRank(
          projectId,
          updatedRank,
          preferenceType,
        );
        audit("Draft preference rank updated successfully", {
          studentId,
          projectId,
          updatedRank,
        });
      },
    ),

  getAllocatedStudents: procedure.instance.subGroupAdmin
    .output(
      z.array(
        z.object({ student: studentDtoSchema, project: projectDtoSchema }),
      ),
    )
    .query(async ({ ctx: { instance } }) => [
      ...(await instance.getAllocatedStudentsByMethods([
        AllocationMethod.RANDOM,
      ])),
      ...(await instance.getAllocatedStudentsByMethods([
        AllocationMethod.MANUAL,
      ])),
      ...(await instance.getAllocatedStudentsByMethods([
        AllocationMethod.ALGORITHMIC,
      ])),
      ...(await instance.getAllocatedStudentsByMethods([
        AllocationMethod.PRE_ALLOCATED,
      ])),
    ]),

  getAllocatedStudentsByMethod: procedure.instance.subGroupAdmin
    .input(z.object({ methods: z.array(allocationMethodSchema) }))
    .output(
      z.array(
        z.object({ student: studentDtoSchema, project: projectDtoSchema }),
      ),
    )
    .query(
      async ({ ctx: { instance }, input: { methods } }) =>
        await instance.getAllocatedStudentsByMethods(methods),
    ),

  getUnallocatedStudents: procedure.instance.subGroupAdmin
    .output(z.array(studentDtoSchema))
    .query(async ({ ctx: { instance } }) => {
      const unmatchedStudents = await instance.getUnallocatedStudents();
      return unmatchedStudents;
    }),

  getProjectsWithAllocationStatus: procedure.instance.subGroupAdmin
    .output(
      z.array(
        z.discriminatedUnion("status", [
          z.object({
            project: projectDtoSchema,
            supervisor: supervisorDtoSchema,
            status: allocationMethodSchema,
            studentId: z.string(),
          }),
          z.object({
            project: projectDtoSchema,
            supervisor: supervisorDtoSchema,
            status: z.literal(ProjectAllocationStatus.UNALLOCATED),
          }),
        ]),
      ),
    )
    .query(async ({ ctx: { instance } }) => {
      const allProjects = await instance.getProjectDetails();
      const allAllocations = await instance.getProjectAllocations();

      const allAllocationsMap = allAllocations.reduce(
        (acc, a) => ({ ...acc, [a.project.id]: a.method }),
        {} as Record<string, AllocationMethod>,
      );

      return allProjects
        .map(({ project, supervisor, allocatedStudent }) =>
          !allAllocationsMap[project.id] || !allocatedStudent
            ? {
                project,
                supervisor,
                status: ProjectAllocationStatus.UNALLOCATED,
              }
            : {
                project,
                supervisor,
                status: allAllocationsMap[project.id],
                studentId: allocatedStudent.id,
              },
        )
        .sort((a, b) => a.project.title.localeCompare(b.project.title))
        .sort((a, b) => statusRank[a.status] - statusRank[b.status]);
    }),

  getSupervisorsWithAllocations: procedure.instance.subGroupAdmin
    .output(
      z.array(
        z.object({
          supervisor: supervisorDtoSchema,
          allocations: z.array(
            z.object({ project: projectDtoSchema, student: studentDtoSchema }),
          ),
        }),
      ),
    )
    .query(
      async ({ ctx: { instance } }) =>
        await instance.getSupervisorAllocationDetails(),
    ),

  saveManualStudentAllocation: procedure.instance.subGroupAdmin
    .input(
      z.object({
        studentId: z.string(),
        projectId: z.string(),
        supervisorId: z.string(),
      }),
    )
    .output(z.void())
    .mutation(
      async ({
        ctx: { instance, audit },
        input: { studentId, projectId, supervisorId },
      }) => {
        const conflictStudent = await instance.getProjectAllocation(projectId);
        const student = await instance.getStudent(studentId);
        const studentData = await student.get();

        await instance.saveManualAllocationAtomic(
          studentId,
          projectId,
          supervisorId,
          studentData.flag.id,
          conflictStudent?.id,
        );

        audit("Manual allocation successful", {
          studentId,
          projectId,
          supervisorId,
        });
      },
    ),

  getReaders: procedure.instance.subGroupAdmin
    .output(z.array(readerDtoSchema))
    .query(async ({ ctx: { instance } }) => await instance.getReaders()),

  addReader: procedure.instance.subGroupAdmin
    .input(z.object({ newReader: readerDtoSchema }))
    .output(LinkUserResultSchema)
    .mutation(
      async ({
        ctx: { instance, institution, audit },
        input: { newReader },
      }) => {
        if (await instance.isReader(newReader.id)) {
          audit("Added reader", {
            readerId: newReader.id,
            result: LinkUserResult.PRE_EXISTING,
          });
          return LinkUserResult.PRE_EXISTING;
        }

        const userExists = await institution.userExists(newReader.id);

        if (!userExists) await institution.createUser(newReader);

        await instance.linkUser(newReader);
        await instance.linkManyReaders([newReader]);

        if (!userExists) {
          audit("Added reader", {
            readerId: newReader.id,
            result: LinkUserResult.CREATED_NEW,
          });
          return LinkUserResult.CREATED_NEW;
        } else {
          audit("Added reader", {
            readerId: newReader.id,
            result: LinkUserResult.OK,
          });
          return LinkUserResult.OK;
        }
      },
    ),

  addManyReaders: procedure.instance.subGroupAdmin
    .input(z.object({ newReaders: z.array(readerDtoSchema) }))
    .output(z.array(LinkUserResultSchema))
    .mutation(
      async ({
        ctx: { instance, institution, audit },
        input: { newReaders },
      }) => {
        const existingReaderIds = await instance
          .getReaders()
          .then((data) => data.map(({ id }) => id));

        const existingUserIds = await institution
          .getUsers()
          .then((data) => data.map(({ id }) => id));

        await institution.createUsers(
          newReaders.map((s) => ({ id: s.id, name: s.name, email: s.email })),
        );

        await instance.linkUsers(newReaders);

        await instance.linkManyReaders(newReaders);

        const res = newReaders.map((s) => {
          if (existingReaderIds.includes(s.id)) {
            return LinkUserResult.PRE_EXISTING;
          }
          if (existingUserIds.includes(s.id)) {
            return LinkUserResult.CREATED_NEW;
          }
          return LinkUserResult.OK;
        });

        audit("Added new readers", { data: res });

        return res;
      },
    ),

  deleteReader: procedure.instance
    .inStage(previousStages(Stage.READER_BIDDING))
    .subGroupAdmin.input(z.object({ readerId: z.string() }))
    .output(z.void())
    .mutation(async ({ ctx: { instance, audit }, input: { readerId } }) => {
      audit("Deleted reader", { readerId });
      return await instance.deleteReader(readerId);
    }),

  deleteManyReaders: procedure.instance
    .inStage(previousStages(Stage.READER_BIDDING))
    .subGroupAdmin.input(z.object({ readerIds: z.array(z.string()) }))
    .output(z.void())
    .mutation(async ({ ctx: { instance, audit }, input: { readerIds } }) => {
      audit("Deleted readers", { readerIds });
      return await instance.deleteManyReaders(readerIds);
    }),

  getReaderPreferences: procedure.instance.subGroupAdmin
    .input(z.object({ readerId: z.string() }))
    .output(
      z.array(
        z.object({
          project: projectDtoSchema,
          type: extendedReaderPreferenceTypeSchema,
        }),
      ),
    )
    .query(async ({ ctx: { instance }, input: { readerId } }) => {
      const reader = await instance.getReader(readerId);
      return await reader.getPreferences();
    }),

  updateReaderPreference: procedure.instance.subGroupAdmin
    .input(
      z.object({
        readerId: z.string(),
        projectId: z.string(),
        readingPreference: extendedReaderPreferenceTypeSchema,
      }),
    )
    .output(extendedReaderPreferenceTypeSchema)
    .mutation(
      async ({
        ctx: { instance },
        input: { readerId, projectId, readingPreference },
      }) => {
        const reader = await instance.getReader(readerId);
        return await reader.updateReadingPreference(
          projectId,
          readingPreference,
        );
      },
    ),

  getReaderPreferenceData: procedure.instance.subGroupAdmin
    .output(
      z.array(
        z.object({
          reader: readerDtoSchema,
          numPreferred: z.number(),
          numVetoed: z.number(),
        }),
      ),
    )
    .query(
      async ({ ctx: { instance } }) => await instance.getReaderPreferenceData(),
    ),

  getReadingOverviewData: procedure.instance.subGroupAdmin
    .output(
      z.object({
        totalRequired: z.number(),
        totalAvailable: z.number(),
        numRead: z.number(),
      }),
    )
    .query(async ({ ctx: { instance } }) => ({
      totalRequired: await instance.getTotalRequiredReaders(),
      totalAvailable: await instance.getTotalReadingUnits(),
      numRead: await instance.getTotalProjectsRead(),
    })),

  getReaderAllocation: procedure.instance.subGroupAdmin
    .output(
      z.array(
        z.object({
          project: projectDtoSchema,
          supervisor: supervisorDtoSchema,
          student: studentDtoSchema,
          reader: readerDtoSchema.optional(),
          preferenceType: extendedReaderPreferenceTypeSchema.optional(),
        }),
      ),
    )
    .query(
      async ({ ctx: { instance } }) => await instance.getReaderAllocation(),
    ),

  getReaderAllocationStats: procedure.instance.subGroupAdmin
    .output(
      z.array(
        z.object({ reader: readerDtoSchema, numAllocations: z.number() }),
      ),
    )
    .query(
      async ({ ctx: { instance } }) =>
        await instance.getReaderAllocationStats(),
    ),

  getHeaderTabs: procedure.user
    .input(z.object({ params: instanceParamsSchema.partial() }))
    .query(async ({ ctx, input }) => {
      const result = instanceParamsSchema.safeParse(input.params);

      // TODO consider moving this control flow to client
      if (!result.success) return { headerTabs: [], instancePath: "" };

      const instance = new AllocationInstance(ctx.db, result.data);

      const instanceData = await instance.get();

      const roles = await ctx.user.getRolesInInstance(instance.params);

      const instancePath = formatParamsAsPath(instance.params);

      if (!roles.has(Role.ADMIN)) {
        return {
          headerTabs: [PAGES.instanceHome, PAGES.allProjects],
          instancePath,
        };
      }

      const headerTabs =
        instanceData.stage === Stage.SETUP
          ? [PAGES.instanceHome]
          : [PAGES.instanceHome, PAGES.allProjects];

      return { headerTabs, instancePath };
    }),

  // getSupervisorAllocationAccess: procedure.instance.member
  //   .output(z.boolean())
  //   .query(async ({ ctx: { instance } }) => {
  //     const { supervisorAllocationAccess } = await instance.get();
  //     return supervisorAllocationAccess;
  //   }),

  setSupervisorAllocationAccess: procedure.instance.subGroupAdmin
    .input(z.object({ access: z.boolean() }))
    .output(z.boolean())
    .mutation(async ({ ctx: { instance, audit }, input: { access } }) => {
      audit("Set supervisor allocation access", { access });
      return await instance.setSupervisorPublicationAccess(access);
    }),

  getStudentAllocationAccess: procedure.instance.member
    .output(z.boolean())
    .query(async ({ ctx: { instance } }) => {
      const { studentAllocationAccess } = await instance.get();
      return studentAllocationAccess;
    }),

  setStudentAllocationAccess: procedure.instance.subGroupAdmin
    .input(z.object({ access: z.boolean() }))
    .output(z.boolean())
    .mutation(async ({ ctx: { instance, audit }, input: { access } }) => {
      audit("Set student allocation access", { setTo: access });
      return await instance.setStudentPublicationAccess(access);
    }),

  getSidePanelTabs: procedure.instance.member
    .output(z.array(tabGroupSchema))
    .query(async ({ ctx: { instance, user } }) => {
      const { stage } = await instance.get();
      const roles = await user.getRolesInInstance(instance.params);
      const preAllocatedProject = await user.hasSelfDefinedProject(
        instance.params,
      );

      const tabGroups = [];

      if (roles.has(Role.ADMIN)) {
        tabGroups.push({
          title: "General",
          tabs: [
            PAGES.stageControl,
            PAGES.settings,
            PAGES.allSupervisors,
            PAGES.allStudents,
            PAGES.allProjects,
          ],
        });

        tabGroups.push({
          title: "Stage-specific",
          tabs: await instance.getAdminTabs(),
        });
      }

      if (roles.has(Role.SUPERVISOR)) {
        const isSecondRole = roles.size > 1;
        const supervisorTabs = await instance.getSupervisorTabs();

        if (!isSecondRole) {
          tabGroups.push({ title: "General", tabs: [PAGES.allProjects] });
          supervisorTabs.unshift(PAGES.instanceTasks);
        } else if (stage !== Stage.SETUP) {
          supervisorTabs.unshift(PAGES.nonAdminSupervisorTasks);
        }

        tabGroups.push({ title: "Supervisor", tabs: supervisorTabs });
      }

      if (roles.has(Role.READER)) {
        const isSecondRole = roles.size > 1;
        const readerTabs = await instance.getReaderTabs();

        if (!isSecondRole) {
          tabGroups.push({ title: "General", tabs: [PAGES.allProjects] });
          readerTabs.unshift(PAGES.instanceTasks);
        } else if (stage !== Stage.SETUP) {
          readerTabs.unshift(PAGES.nonAdminReaderTasks);
        }

        tabGroups.push({ title: "Reader", tabs: readerTabs });
      }

      if (roles.has(Role.STUDENT)) {
        const isSecondRole = roles.size > 1;
        const studentTabs = await instance.getStudentTabs(!preAllocatedProject);

        tabGroups.push({ title: "General", tabs: [PAGES.allProjects] });
        tabGroups.push({
          title: "Student",
          tabs: isSecondRole
            ? studentTabs
            : [PAGES.instanceTasks, ...studentTabs],
        });
      }

      return tabGroups;
    }),

  getAllReaderPreferences: procedure.instance.subGroupAdmin
    .output(z.array(matchingReaderSchema))
    .query(
      async ({ ctx: { instance } }) => await instance.getReaderPreferences(),
    ),

  runReaderAllocation: procedure.instance.subGroupAdmin
    .output(matchingOutputSchema)
    .mutation(async ({ ctx: { instance } }) => {
      const allReaders = await instance.getReaderPreferences();
      const allProjectData = await instance.getAllocatedProjectsWithoutReader();
      const allProjects = allProjectData.map((p) => p.id);

      const allocator = new HttpReaderAllocator(env.MATCHING_SERVER_URL);

      const result = await allocator.allocate({ allProjects, allReaders });

      // Writes to db; could separate this to a second proc.
      // Thoughts @pkitazos?
      await instance.setReaderAllocations(result.assignments);
      return result;
    }),

  // pin -
  getMarkerSubmissions: procedure.instance.subGroupAdmin
    .input(z.object({ unitOfAssessmentId: z.string() }))
    .output(
      z.array(
        z.object({
          project: projectDtoSchema,
          student: studentDtoSchema,
          supervisor: supervisorDtoSchema,
          supervisorGrade: z.string().optional(),
          reader: readerDtoSchema,
          readerGrade: z.string().optional(),
        }),
      ),
    )
    .query(async () => {
      return [];
      // const supervisors = await instance.getSupervisors();

      // const supervisorMap = supervisors.reduce(
      //   (acc, supervisor) => ({ ...acc, [supervisor.id]: supervisor }),
      //   {} as Record<string, SupervisorDTO>,
      // );

      // const readers = await instance.getReaders();

      // const readerMap = readers.reduce(
      //   (acc, reader) => ({ ...acc, [reader.id]: reader }),
      //   {} as Record<string, ReaderDTO>,
      // );

      // const submission = await db.unitOfAssessment.findFirstOrThrow({
      //   where: { id: unitOfAssessmentId },
      //   include: { assessmentCriteria: { include: { scores: true } } },
      // });

      // const studentAllocations = await db.studentProjectAllocation.findMany({
      //   where: expand(instance.params),
      //   include: {
      //     student: {
      //       include: {
      //         studentFlag: true,
      //         userInInstance: { include: { user: true } },
      //       },
      //     },
      //     project: {
      //       include: {
      //         readerAllocations: { include: { reader: true } },
      //         flagsOnProject: { include: { flag: true } },
      //         tagsOnProject: { include: { tag: true } },
      //       },
      //     },
      //   },
      // });

      // return (
      //   studentAllocations
      //     // WARNING: remove filter before deploying to prod
      //     .filter((a) => {
      //       const has_reader = a.project.readerAllocations.length > 0;
      //       if (!has_reader) {
      //         console.log("no reader: ", a.project.title);
      //       }
      //       return has_reader;
      //     })

      //     .map((a) => {
      //       const ra = a.project.readerAllocations.find((r) => !r.thirdMarker);
      //       if (!ra) {
      //         throw new Error(
      //           "instance.getMarkerSubmissions: Reader allocation not found",
      //         );
      //       }

      //       const reader = readerMap[ra.readerId];

      //       if (!reader) {
      //         throw new Error(
      //           "instance.getMarkerSubmissions: Reader not found",
      //         );
      //       }

      //       const supervisor = supervisorMap[a.project.supervisorId];

      //       if (!supervisor) {
      //         throw new Error(
      //           "instance.getMarkerSubmissions: Supervisor not found",
      //         );
      //       }

      //       const supervisorScores = submission.assessmentCriteria.map((c) => {
      //         const supervisorScore = c.scores.find(
      //           (s) => s.markerId === supervisor.id,
      //         );
      //         if (!supervisorScore) return undefined;
      //         return { weight: c.weight, score: supervisorScore.grade };
      //       });

      //       let supervisorGrade: string | undefined;
      //       if (supervisorScores.every((s) => s !== undefined)) {
      //         supervisorGrade = Grade.toLetter(
      //           Grade.computeFromScores(supervisorScores),
      //         );
      //       }

      //       const readerScores = submission.assessmentCriteria.map((c) => {
      //         const readerScore = c.scores.find(
      //           (s) => s.markerId === reader.id,
      //         );
      //         if (!readerScore) return undefined;
      //         return { weight: c.weight, score: readerScore.grade };
      //       });

      //       let readerGrade: string | undefined;
      //       if (readerScores.every((s) => s !== undefined)) {
      //         readerGrade = Grade.toLetter(
      //           Grade.computeFromScores(readerScores),
      //         );
      //       }

      //       return {
      //         project: T.toProjectDTO(a.project),
      //         student: T.toStudentDTO(a.student),
      //         supervisor,
      //         supervisorGrade,
      //         reader,
      //         readerGrade,
      //       };
      //     })
      // );
    }),

  assignReaders: procedure.instance
    // eslint-disable-next-line @typescript-eslint/no-deprecated
    .inStage([Stage.READER_BIDDING, Stage.READER_ALLOCATION])
    .subGroupAdmin.input(
      z.object({ newReaderAllocations: z.array(newReaderAllocationSchema) }),
    )
    .output(z.array(readerAssignmentResultSchema))
    .mutation(
      // TODO emit audit
      async ({ ctx: { db, instance }, input: { newReaderAllocations } }) => {
        const projectAllocationData =
          await instance.getStudentAllocationDetails();
        const studentIds = projectAllocationData.map((a) => a.student.id);

        const readers = await instance.getReaders();
        const readerIds = readers.map(({ id }) => id);

        const allocationData = newReaderAllocations.map((data) => {
          let status: ReaderAssignmentResult = ReaderAssignmentResult.OK;

          if (!studentIds.includes(data.studentId))
            status = ReaderAssignmentResult.MISSING_STUDENT;

          if (!readerIds.includes(data.reader.id))
            status = ReaderAssignmentResult.MISSING_READER;

          return { data, status };
        });

        const studentProjectMap = projectAllocationData.reduce(
          // TODO: fix
          // eslint-disable-next-line @typescript-eslint/no-non-null-asserted-optional-chain
          (acc, val) => ({ ...acc, [val.student.id]: val.allocation?.id! }),
          {} as Record<string, string>,
        );

        await db.readerProjectAllocation.createMany({
          data: allocationData
            .filter((e) => e.status === ReaderAssignmentResult.OK)
            .map(({ data: { reader, studentId } }) => ({
              ...expand(instance.params),
              readerId: reader.id,
              studentId,
              projectId: studentProjectMap[studentId],
              thirdMarker: false, // TODO needs to come from somewhere
            })),
        });

        return allocationData.map((e) => e.status);
      },
    ),

  getAllUnitsOfAssessment: procedure.instance
    // eslint-disable-next-line @typescript-eslint/no-deprecated
    .inStage([Stage.MARK_SUBMISSION])
    .subGroupAdmin.output(
      z.array(
        z.object({
          flag: flagDtoSchema,
          units: z.array(unitOfAssessmentDtoSchema),
        }),
      ),
    )
    .query(async ({ ctx: { instance, db } }) => {
      const flags = await db.flag.findMany({
        where: expand(instance.params),
        include: {
          unitsOfAssessment: {
            include: { flag: true, assessmentCriteria: true },
            orderBy: [{ markerSubmissionDeadline: "asc" }],
          },
        },
        orderBy: [{ displayName: "asc" }],
      });

      return flags.map((f) => ({
        flag: T.toFlagDTO(f),
        units: f.unitsOfAssessment.map((x) => T.toUnitOfAssessmentDTO(x)),
      }));
    }),

  getProjectsWithReadingAllocationStatus: procedure.instance.subGroupAdmin
    .output(
      z.array(
        z.object({
          project: projectDtoSchema,
          supervisor: supervisorDtoSchema,
          student: studentDtoSchema,
          currentReaderId: z.string().optional(),
        }),
      ),
    )
    .query(async ({ ctx: { db, instance } }) => {
      const projectData = await db.studentProjectAllocation.findMany({
        where: expand(instance.params),
        include: {
          project: {
            include: {
              flagsOnProject: { include: { flag: true } },
              tagsOnProject: { include: { tag: true } },
              supervisor: {
                include: { userInInstance: { include: { user: true } } },
              },
              readerAllocations: { include: { reader: true } },
            },
          },
          student: {
            include: {
              studentFlag: true,
              userInInstance: { include: { user: true } },
            },
          },
        },
      });

      return projectData.map(({ project, student }) => ({
        project: T.toProjectDTO(project),
        supervisor: T.toSupervisorDTO(project.supervisor),
        student: T.toStudentDTO(student),
        currentReaderId: project.readerAllocations[0]?.readerId,
      }));
    }),

  getReadersWithWorkload: procedure.instance.subGroupAdmin
    .output(z.array(readerDtoSchema.extend({ currentAllocations: z.number() })))
    .query(async ({ ctx: { db, instance } }) => {
      const readerData = await db.readerDetails.findMany({
        where: expand(instance.params),
        include: {
          userInInstance: { include: { user: true } },
          projectAllocations: true,
        },
      });

      return readerData.map((reader) => ({
        ...T.toReaderDTO(reader),
        currentAllocations: reader.projectAllocations.length,
      }));
    }),

  saveManualReaderAllocation: procedure.instance.subGroupAdmin
    .input(z.object({ projectId: z.string(), readerId: z.string() }))
    .output(z.void())
    .mutation(
      async ({
        ctx: { db, instance, audit },
        input: { projectId, readerId },
      }) => {
        await db.readerProjectAllocation.upsert({
          where: {
            instanceReaderProjectAllocation: {
              ...expand(instance.params),
              projectId,
            },
          },
          update: { readerId },
          create: { ...expand(instance.params), projectId, readerId },
        });
        audit("Manual reader allocation saved", { projectId, readerId });
      },
    ),

  removeReaderAllocation: procedure.instance.subGroupAdmin
    .input(z.object({ projectId: z.string() }))
    .output(z.void())
    .mutation(
      async ({ ctx: { db, instance, audit }, input: { projectId } }) => {
        await db.readerProjectAllocation.delete({
          where: {
            instanceReaderProjectAllocation: {
              ...expand(instance.params),
              projectId,
            },
          },
        });
        audit("Reader allocation removed", { projectId });
      },
    ),

  setUnitOfAssessmentAccess: procedure.instance
    // eslint-disable-next-line @typescript-eslint/no-deprecated
    .inStage([Stage.MARK_SUBMISSION])
    .subGroupAdmin.input(
      z.object({ unitOfAssessmentId: z.string(), open: z.boolean() }),
    )
    .output(z.string())
    .mutation(
      async ({ ctx: { db, audit }, input: { unitOfAssessmentId, open } }) => {
        audit("Set unit of assessment access", { unitOfAssessmentId, open });
        return await db.unitOfAssessment
          .update({ where: { id: unitOfAssessmentId }, data: { open } })
          .then((u) => u.title);
      },
    ),
});
