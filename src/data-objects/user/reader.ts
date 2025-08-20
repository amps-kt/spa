import { type ProjectDTO, type StudentDTO } from "@/dto";

import { Transformers as T } from "@/db/transformers";
import { type DB } from "@/db/types";

import { expand } from "@/lib/utils/general/instance-params";
import { type InstanceParams } from "@/lib/validations/params";

import { Marker } from ".";

export class Reader extends Marker {
  constructor(db: DB, id: string, params: InstanceParams) {
    super(db, id, params);
  }

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
}
