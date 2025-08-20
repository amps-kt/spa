import { z } from "zod";

import { type ReaderDTO, type ProjectDTO, type StudentDTO } from "@/dto";

import { Transformers as T } from "@/db/transformers";
import { type DB } from "@/db/types";

import { expand } from "@/lib/utils/general/instance-params";
import { institutionIdSchema } from "@/lib/validations/institution-id";
import { type InstanceParams } from "@/lib/validations/params";

import { Marker } from ".";

export class Reader extends Marker {
  constructor(db: DB, id: string, params: InstanceParams) {
    super(db, id, params);
  }

  public static newCSVSchema = z.object({
    fullName: z
      .string("Please enter a valid name")
      .min(1, "Please enter a valid name"),
    institutionId: institutionIdSchema,
    email: z
      .email("Please enter a valid email address")
      .transform((x) => x.toLowerCase()),
    workloadQuota: z.coerce
      .number<number>({
        error: (issue) =>
          issue.input === undefined ? "Required" : "Invalid integer",
      })
      .int("Please enter an integer for the workload quota")
      .nonnegative("Workload quota must be a non-negative integer"),
  });

  public static capacitiesSchema = this.newCSVSchema.pick({
    workloadQuota: true,
  });

  public async getAllocations(): Promise<
    { project: ProjectDTO; student: StudentDTO }[]
  > {
    const data = await this.db.readerProjectAllocation.findMany({
      where: { ...expand(this.instance.params), readerId: this.id },
      include: {
        project: {
          include: {
            flagsOnProject: { include: { flag: true } },
            tagsOnProject: { include: { tag: true } },
            studentAllocations: {
              include: {
                student: {
                  include: {
                    userInInstance: { include: { user: true } },
                    studentFlag: {
                      include: {
                        unitsOfAssessment: {
                          include: { assessmentCriteria: true, flag: true },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

    // TODO this should probably return an arr?
    return data.map((a) => ({
      project: T.toProjectDTO(a.project),
      student: a.project.studentAllocations.map(({ student }) =>
        T.toStudentDTO(student),
      )[0],
    }));
  }

  public async toDTO(): Promise<ReaderDTO> {
    return await this.db.readerDetails
      .findFirstOrThrow({
        where: { userId: this.id, ...expand(this.instance.params) },
        include: { userInInstance: { include: { user: true } } },
      })
      .then((x) => T.toReaderDTO(x));
  }

  public async setCapacityDetails({
    workloadQuota,
  }: {
    workloadQuota: number;
  }): Promise<ReaderDTO> {
    const readerData = await this.db.readerDetails.update({
      where: {
        readerDetailsId: { userId: this.id, ...expand(this.instance.params) },
      },
      data: { projectAllocationTarget: workloadQuota },
      include: { userInInstance: { include: { user: true } } },
    });

    return T.toReaderDTO(readerData);
  }
}
