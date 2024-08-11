import {
  AdminInSpace,
  AdminLevel,
  AllocationGroup,
  AllocationInstance,
  AllocationSubGroup,
  Flag,
  FlagOnProject,
  Invitation,
  Preference,
  PreferenceType,
  Project,
  Role,
  Stage,
  SupervisorInstanceDetails,
  Tag,
  TagOnProject,
  UserInInstance,
} from "@prisma/client";
import { User } from "next-auth";

import {
  GenerousAlgorithm,
  GreedyAlgorithm,
  GreedyGenAlgorithm,
  MinCostAlgorithm,
} from "@/lib/algorithms";
import { slugify } from "@/lib/utils/general/slugify";

import { preferenceData } from "./preferences";
import { projectData } from "./projects";

export const EVALUATORS = 30;

type StableUser = Omit<User, "id"> & {
  id: string;
};
type New<T> = Omit<T, "id" | "systemId">;

export const superAdmin: StableUser = {
  id: "pk150z",
  name: "Petros Kitazos",
  email: "test@gmail.com",
};

export const superAdminInSpace: New<AdminInSpace> = {
  userId: superAdmin.id,
  allocationGroupId: null,
  allocationSubGroupId: null,
  adminLevel: AdminLevel.SUPER,
};

export const to_ID = (ID: number) => ID.toString().padStart(3, "0");

export const evaluator__subGroupAdmin = (ID: string): StableUser => ({
  id: `${ID}-012345w`,
  name: "Admin Evaluator",
  email: `${ID}-012345w@email.com`,
});

const dummy__supervisors = (ID: string): StableUser[] => [
  {
    id: `${ID}-123456s`,
    name: "Daniel Schmidt",
    email: `${ID}-123456s@email.com`,
  },
  {
    id: `${ID}-123457j`,
    name: "Sarah Jones",
    email: `${ID}-123457j@email.com`,
  },
  {
    id: `${ID}-123458t`,
    name: "Kai Tanaka",
    email: `${ID}-123458t@email.com`,
  },
  {
    id: `${ID}-123459l`,
    name: "Maria Lopez",
    email: `${ID}-123459l@email.com`,
  },
];

export const evaluator__supervisor = (ID: string): StableUser => ({
  id: `${ID}-123460d`,
  name: "Supervisor Evaluator",
  email: `${ID}-123460d@email.com`,
});

const allSupervisors = (ID: string): StableUser[] => [
  ...dummy__supervisors(ID),
  evaluator__supervisor(ID),
];

const dummy__students = (ID: string): StableUser[] => [
  {
    id: `${ID}-234567k`,
    name: "Aaliyah Khan",
    email: `${ID}-234567k@email.com`,
  },
  {
    id: `${ID}-234568g`,
    name: "Diego Garcia",
    email: `${ID}-234568g@email.com`,
  },
  { id: `${ID}-234569c`, name: "Mei Chen", email: `${ID}-234569c@email.com` },
  {
    id: `${ID}-234570p`,
    name: "Anya Petrova",
    email: `${ID}-234570p@email.com`,
  },
  {
    id: `${ID}-234571d`,
    name: "Aisha Diallo",
    email: `${ID}-234571d@email.com`,
  },
  {
    id: `${ID}-234572c`,
    name: "Ethan Cohen",
    email: `${ID}-234572c@email.com`,
  },
  {
    id: `${ID}-234573b`,
    name: "Nadira Benali",
    email: `${ID}-234573b@email.com`,
  },
  {
    id: `${ID}-234574o`,
    name: "Liam O'Sullivan",
    email: `${ID}-234574o@email.com`,
  },
  {
    id: `${ID}-234575y`,
    name: "Hana Yoshida",
    email: `${ID}-234575y@email.com`,
  },
  {
    id: `${ID}-234576n`,
    name: "David Nguyen",
    email: `${ID}-234576n@email.com`,
  },
  {
    id: `${ID}-234577r`,
    name: "Elena Rodriguez",
    email: `${ID}-234577r@email.com`,
  },
  {
    id: `${ID}-234578a`,
    name: "Kofi Asante",
    email: `${ID}-234578a@email.com`,
  },
  {
    id: `${ID}-234579k`,
    name: "Olivia Kapoor",
    email: `${ID}-234579k@email.com`,
  },
  {
    id: `${ID}-234580h`,
    name: "Mateo Hernandez",
    email: `${ID}-234580h@email.com`,
  },
];

export const evaluator__student = (ID: string): StableUser => ({
  id: `${ID}-234581p`,
  name: "Student Evaluator",
  email: `${ID}-234581p@email.com`,
});

const allStudents = (ID: string): StableUser[] => [
  ...dummy__students(ID),
  evaluator__student(ID),
];

export const allUsers = (ID: string): StableUser[] => [
  evaluator__subGroupAdmin(ID),
  ...allSupervisors(ID),
  ...allStudents(ID),
];

const supervisorCapacities = (
  ID: string,
): (Pick<
  SupervisorInstanceDetails,
  | "projectAllocationLowerBound"
  | "projectAllocationTarget"
  | "projectAllocationUpperBound"
> & { userId: string })[] => [
  {
    userId: allSupervisors(ID)[0].id,
    projectAllocationLowerBound: 0,
    projectAllocationTarget: 1,
    projectAllocationUpperBound: 3,
  },
  {
    userId: allSupervisors(ID)[1].id,
    projectAllocationLowerBound: 0,
    projectAllocationTarget: 2,
    projectAllocationUpperBound: 3,
  },
  {
    userId: allSupervisors(ID)[2].id,
    projectAllocationLowerBound: 0,
    projectAllocationTarget: 2,
    projectAllocationUpperBound: 3,
  },
  {
    userId: allSupervisors(ID)[3].id,
    projectAllocationLowerBound: 0,
    projectAllocationTarget: 2,
    projectAllocationUpperBound: 3,
  },
  {
    userId: allSupervisors(ID)[4].id,
    projectAllocationLowerBound: 0,
    projectAllocationTarget: 2,
    projectAllocationUpperBound: 3,
  },
];

const allocationInstance = {
  id: "2024-2025",
  displayName: "2024-2025",
};

const allocationSubGroup = {
  id: "lvl-4",
  displayName: "Level 4 Individual Project",
};

const allocationGroup = (ID: string) => ({
  id: `socs-${ID}`,
  displayName: `School of Computing Science ${ID}`,
});

const instanceId = (ID: string) => ({
  allocationGroupId: allocationGroup(ID).id,
  allocationInstanceId: allocationInstance.id,
  allocationSubGroupId: allocationSubGroup.id,
});

const inInstance = <T>(ID: string, data: T) => ({
  ...instanceId(ID),
  ...data,
});

const flagData: Pick<Flag, "title">[] = [
  { title: "BSc Computing Science" },
  { title: "BSc Software Engineering" },
  { title: "MSci Computing Science" },
  { title: "MSci Software Engineering" },
  { title: "CS Joint Honours" },
];

const tagData: Pick<Tag, "title">[] = [
  { title: "Python" },
  { title: "Java" },
  { title: "C++" },
  { title: "JavaScript" },
  { title: "Ruby" },
  { title: "PHP" },
  { title: "HTML/CSS" },
  { title: "Artificial Intelligence" },
  { title: "Machine Learning" },
  { title: "Data Science" },
  { title: "Web Development" },
  { title: "Mobile App Development" },
  { title: "Cybersecurity" },
  { title: "Databases" },
  { title: "Cloud Computing" },
  { title: "DevOps" },
  { title: "Natural Language Processing" },
  { title: "Computer Vision" },
  { title: "Game Development" },
];

// dependant

export const invites = (ID: string): Invitation[] => [
  inInstance(ID, { email: evaluator__subGroupAdmin(ID).email! }),
  ...dummy__supervisors(ID).map((s) => inInstance(ID, { email: s.email! })),
  ...dummy__students(ID).map((s) => inInstance(ID, { email: s.email! })),
];

export const sampleGroup = (ID: string): AllocationGroup => ({
  id: allocationGroup(ID).id,
  displayName: allocationGroup(ID).displayName,
});

export const sampleSubGroup = (ID: string): AllocationSubGroup => ({
  id: allocationSubGroup.id,
  allocationGroupId: allocationGroup(ID).id,
  displayName: allocationSubGroup.displayName,
});

export const sampleInstance = (ID: string): AllocationInstance => ({
  id: allocationInstance.id,
  allocationGroupId: allocationGroup(ID).id,
  allocationSubGroupId: allocationSubGroup.id,
  displayName: allocationInstance.displayName,
  stage: Stage.SETUP,
  supervisorsCanAccess: false,
  projectSubmissionDeadline: new Date(2024, 2, 20),
  studentsCanAccess: false,
  preferenceSubmissionDeadline: new Date(2024, 3, 20),
  minPreferences: 6,
  maxPreferences: 6,
  maxPreferencesPerSupervisor: 2,
  selectedAlgName: null,
  parentInstanceId: null,
});

export const adminsInSpaces = (ID: string): New<AdminInSpace>[] => [
  {
    userId: evaluator__subGroupAdmin(ID).id,
    allocationGroupId: allocationGroup(ID).id,
    allocationSubGroupId: allocationSubGroup.id,
    adminLevel: AdminLevel.SUB_GROUP,
  },
];

const supervisors__userInInstance = (ID: string): UserInInstance[] =>
  allSupervisors(ID).map(({ id }) =>
    inInstance(ID, {
      userId: id,
      role: Role.SUPERVISOR,
      joined: true,
      submittedPreferences: false,
    }),
  );

const students__userInInstance = (ID: string): UserInInstance[] =>
  dummy__students(ID).map(({ id }) =>
    inInstance(ID, {
      userId: id,
      role: Role.STUDENT,
      joined: true,
      submittedPreferences: true,
    }),
  );

const evaluator__student__userInInstance = (ID: string): UserInInstance =>
  inInstance(ID, {
    userId: evaluator__student(ID).id,
    role: Role.STUDENT,
    joined: true,
    submittedPreferences: false,
  });

export const allUsersInInstance = (ID: string): UserInInstance[] => [
  ...supervisors__userInInstance(ID),
  ...students__userInInstance(ID),
  evaluator__student__userInInstance(ID),
];

export const capacities = (ID: string): SupervisorInstanceDetails[] =>
  supervisorCapacities(ID).map((s) => inInstance(ID, s));

export const projects = (ID: string): Project[] =>
  projectData(ID).map((p) =>
    inInstance(ID, {
      id: p.id,
      title: p.title,
      description: p.description,
      supervisorId: allSupervisors(ID)[p.supervisorId].id,
      preAllocatedStudentId: null,
      capacityLowerBound: 0,
      capacityUpperBound: 1,
    }),
  );

export const preferences = (ID: string): Preference[] =>
  preferenceData(ID).map((p) =>
    inInstance(ID, {
      projectId: p.projectId,
      userId: allStudents(ID)[p.studentIdx].id,
      rank: p.studentRanking,
      type: PreferenceType.PREFERENCE,
    }),
  );

export const flags = (ID: string): Flag[] =>
  flagData.map(({ title }) =>
    inInstance(ID, { id: slugify(ID + title), title }),
  );

export const flagsOnProjects = (ID: string): FlagOnProject[] =>
  projectData(ID).flatMap((p) =>
    p.flags.map((f) => ({
      projectId: p.id,
      flagId: slugify(ID + f.title),
    })),
  );

export const tags = (ID: string): Tag[] =>
  tagData.map(({ title }) =>
    inInstance(ID, { id: slugify(ID + title), title }),
  );

export const tagsOnProjects = (ID: string): TagOnProject[] =>
  projectData(ID).flatMap((p) =>
    p.tags.map((t) => ({
      projectId: p.id,
      tagId: slugify(ID + t.title),
    })),
  );

const builtInAlgorithms = [
  GenerousAlgorithm,
  GreedyAlgorithm,
  MinCostAlgorithm,
  GreedyGenAlgorithm,
];

export const algorithms = (ID: string) =>
  builtInAlgorithms.map((alg) =>
    inInstance(ID, {
      ...alg,
      matchingResultData: JSON.stringify({}),
    }),
  );
