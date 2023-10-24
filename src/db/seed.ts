import { PrismaClient } from "@prisma/client";
import { flagData, invitationData, projectData, tagData } from "./data";

const prisma = new PrismaClient();

async function main() {
  console.log("SEEDING");
  const superAdmin = await prisma.superAdmin.create({
    data: {
      name: "Alice",
      email: "super.allocationapp@gmail.com",
    },
  });

  const allocationGroup = await prisma.allocationGroup.create({
    data: {
      displayName: "School of Computing Science",
      slug: "school-of-computing-science",
      superAdminId: superAdmin.id,
    },
  });

  await prisma.groupAdmin.create({
    data: {
      name: "Bob",
      email: "group.allocationapp@gmail.com",
      allocationGroupId: allocationGroup.id,
    },
  });

  const allocationSubGroup = await prisma.allocationSubGroup.create({
    data: {
      displayName: "Level 4 Individual Project",
      slug: "level-4-individual-project",
      allocationGroupId: allocationGroup.id,
    },
  });

  await prisma.subGroupAdmin.create({
    data: {
      name: "Chris",
      email: "subgroup.allocationapp@gmail.com",
      allocationSubGroupId: allocationSubGroup.id,
    },
  });

  const allocationInstance = await prisma.allocationInstance.create({
    data: {
      displayName: "2023",
      slug: "2023",
      stage: "SETUP",
      allocationSubGroupId: allocationSubGroup.id,
    },
  });

  const supervisor = await prisma.supervisor.create({
    data: {
      name: "Dan",
      email: "supervisor.allocationapp@gmail.com",
      allocationInstances: {
        connect: {
          id: allocationInstance.id,
        },
      },
    },
  });

  const flags = await prisma.flag
    .createMany({
      data: flagData,
    })
    .then(async () => await prisma.flag.findMany({}));

  const tags = await prisma.tag
    .createMany({
      data: tagData,
    })
    .then(async () => await prisma.tag.findMany({}));

  await prisma.student.create({
    data: {
      name: "Eva",
      email: "student.allocationapp@gmail.com",
      schoolId: "2345678e",
      flags: {
        connect: {
          id: flags[0].id,
        },
      },
    },
  });

  await prisma.project.createMany({
    data: projectData.map(({ title, description }) => ({
      title,
      description,
      supervisorId: supervisor.id,
      allocationInstanceId: allocationInstance.id,
    })),
  });

  const projects = await prisma.project.findMany({});

  projects.map(async ({ id }, i) => {
    await prisma.project.update({
      where: {
        id,
      },
      data: {
        flags: {
          connect: {
            id: flags[i % flags.length].id,
          },
        },
        tags: {
          connect: {
            id: tags[i % tags.length].id,
          },
        },
      },
    });
  });

  await prisma.invitation.createMany({
    data: invitationData,
  });
  console.log("ok");
  console.log("SEEDING COMPLETE");
}

main()
  .catch(async (e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
