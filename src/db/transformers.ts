import {
  type MarkingComponentDTO,
  type UnitOfAssessmentDTO,
  type UserDTO,
  type AlgorithmDTO,
  type FlagDTO,
  type GroupDTO,
  type InstanceDTO,
  type InstanceUserDTO,
  type ProjectDTO,
  type ReaderDTO,
  type StudentDTO,
  type SubGroupDTO,
  type SupervisorDTO,
  type TagDTO,
  type ComponentScoreDTO,
  type UnitGradeDTO,
  type MarkingSubmissionDTO,
  markingSubmissionDtoSchema,
  type GradeEntryDTO,
} from "@/dto";
import { type StudentSubmissionInfoDTO } from "@/dto/marking/student-submissions";

import {
  type DB_Algorithm,
  type DB_AllocationGroup,
  type DB_AllocationInstance,
  type DB_AllocationSubGroup,
  type DB_Flag,
  type DB_FlagOnProject,
  type DB_UnitOfAssessment,
  type DB_Project,
  type DB_ReaderDetails,
  type DB_StudentDetails,
  type DB_SupervisorDetails,
  type DB_Tag,
  type DB_TagOnProject,
  type DB_User,
  type DB_UserInInstance,
  DB_ReaderPreferenceType,
  ExtendedReaderPreferenceType,
  type DB_MarkingComponent,
  type DB_UnitOfAssessmentSubmission,
  type DB_MarkingComponentSubmission,
  type DB_UnitOfAssessmentGrade,
  type DB_GradeEntry,
} from "./types";

export class Transformers {
  static toUserDTO({
    id,
    name,
    email,
  }: {
    id: string;
    name: string;
    email: string;
  }): UserDTO {
    return { id, name, email };
  }

  public static toMarkingSubmissionDTO(
    this: void,
    data: DB_UnitOfAssessmentSubmission & {
      criterionScores?: DB_MarkingComponentSubmission[];
    },
  ): MarkingSubmissionDTO {
    return markingSubmissionDtoSchema.parse({
      markerId: data.markerId,
      studentId: data.studentId,
      grade: data.grade ?? undefined,
      unitOfAssessmentId: data.unitOfAssessmentId,
      // ? Does this mean you sometimes won't fetch everything?
      marks: (data.criterionScores ?? []).reduce(
        (acc, val) => ({
          ...acc,
          [val.markingComponentId]: Transformers.toScoreDTO(val),
        }),
        {},
      ),
      finalComment: data.summary ?? undefined,
      recommendation: data.recommendedForPrize,
      draft: data.draft,
    });
  }

  public static toScoreDTO(
    data: DB_MarkingComponentSubmission,
  ): Partial<ComponentScoreDTO> {
    return {
      mark: data.grade ?? undefined,
      justification: data.justification ?? undefined,
    };
  }

  public static toAllocationGroupDTO(
    this: void,
    data: DB_AllocationGroup,
  ): GroupDTO {
    return { group: data.id, displayName: data.displayName };
  }

  public static toAllocationSubGroupDTO(
    this: void,
    data: DB_AllocationSubGroup,
  ): SubGroupDTO {
    return {
      group: data.allocationGroupId,
      subGroup: data.id,
      displayName: data.displayName,
    };
  }

  public static toAllocationInstanceDTO(
    this: void,
    data: DB_AllocationInstance,
  ): InstanceDTO {
    return {
      group: data.allocationGroupId,
      subGroup: data.allocationSubGroupId,
      instance: data.id,
      displayName: data.displayName,
      stage: data.stage,
      selectedAlgConfigId: data.selectedAlgId ?? undefined,
      projectSubmissionDeadline: data.projectSubmissionDeadline,
      supervisorAllocationAccess: data.supervisorAllocationAccess,
      minStudentPreferences: data.minStudentPreferences,
      maxStudentPreferences: data.maxStudentPreferences,
      maxStudentPreferencesPerSupervisor:
        data.maxStudentPreferencesPerSupervisor,
      studentPreferenceSubmissionDeadline:
        data.studentPreferenceSubmissionDeadline,
      studentAllocationAccess: data.studentAllocationAccess,
      minReaderPreferences: data.minReaderPreferences,
      maxReaderPreferences: data.maxReaderPreferences,
      readerPreferenceSubmissionDeadline:
        data.readerPreferenceSubmissionDeadline,
    };
  }

  public static toInstanceUserDTO(
    this: void,
    data: DB_UserInInstance & { user: DB_User },
  ): InstanceUserDTO {
    return {
      id: data.userId,
      name: data.user.name,
      email: data.user.email,
      joined: data.joined,
    };
  }

  public static toStudentDTO(
    this: void,
    data: DB_StudentDetails & {
      userInInstance: DB_UserInInstance & { user: DB_User };
      studentFlag: DB_Flag;
    },
  ): StudentDTO {
    return {
      id: data.userId,
      name: data.userInInstance.user.name,
      email: data.userInInstance.user.email,
      joined: data.userInInstance.joined,
      latestSubmission: data.latestSubmissionDateTime ?? undefined,
      flag: data.studentFlag,
      enrolled: data.enrolled,
    };
  }

  public static toReaderDTO(
    this: void,
    data: DB_ReaderDetails & {
      userInInstance: DB_UserInInstance & { user: DB_User };
    },
  ): ReaderDTO {
    return {
      id: data.userId,
      name: data.userInInstance.user.name,
      email: data.userInInstance.user.email,
      joined: data.userInInstance.joined,
      readingWorkloadQuota: data.readingWorkloadQuota,
    };
  }

  public static toSupervisorDTO(
    this: void,
    data: DB_SupervisorDetails & {
      userInInstance: DB_UserInInstance & { user: DB_User };
    },
  ): SupervisorDTO {
    return {
      id: data.userId,
      name: data.userInInstance.user.name,
      email: data.userInInstance.user.email,
      joined: data.userInInstance.joined,
      allocationLowerBound: data.projectAllocationLowerBound,
      allocationTarget: data.projectAllocationTarget,
      allocationUpperBound: data.projectAllocationUpperBound,
    };
  }

  public static toProjectDTO(
    this: void,
    data: DB_Project & {
      flagsOnProject: (DB_FlagOnProject & { flag: DB_Flag })[];
      tagsOnProject: (DB_TagOnProject & { tag: DB_Tag })[];
    },
  ): ProjectDTO {
    return {
      id: data.id,
      title: data.title,
      description: data.description,
      preAllocatedStudentId: data.preAllocatedStudentId ?? undefined,
      latestEditDateTime: data.latestEditDateTime,
      capacityLowerBound: data.capacityLowerBound,
      capacityUpperBound: data.capacityUpperBound,
      supervisorId: data.supervisorId,
      flags: data.flagsOnProject.map((f) => Transformers.toFlagDTO(f.flag)),
      tags: data.tagsOnProject.map((t) => Transformers.toTagDTO(t.tag)),
    };
  }

  public static toTagDTO(this: void, data: DB_Tag): TagDTO {
    return { id: data.id, title: data.title };
  }

  public static toFlagDTO(this: void, data: DB_Flag): FlagDTO {
    return {
      id: data.id,
      displayName: data.displayName,
      description: data.description,
      layoutIndex: data.layoutIndex,
    };
  }

  public static toAlgorithmDTO(this: void, a: DB_Algorithm): AlgorithmDTO {
    return {
      id: a.id,
      displayName: a.displayName,
      description: a.description ?? undefined,
      createdAt: a.createdAt,
      flag1: a.flag1,
      flag2: a.flag2 ?? undefined,
      flag3: a.flag3 ?? undefined,
      maxRank: a.maxRank,
      targetModifier: a.targetModifier,
      upperBoundModifier: a.upperBoundModifier,
      builtIn: a.builtIn,
    };
  }

  public static toAssessmentCriterionDTO(
    this: void,
    data: DB_MarkingComponent,
  ): MarkingComponentDTO {
    return {
      id: data.id,
      unitOfAssessmentId: data.unitOfAssessmentId,
      title: data.title,
      description: data.description,
      weight: data.weight,
      layoutIndex: data.layoutIndex,
    };
  }

  public static toUnitOfAssessmentDTO(
    this: void,
    data: DB_UnitOfAssessment & {
      flag: DB_Flag;
      markingComponents: DB_MarkingComponent[];
    },
  ): UnitOfAssessmentDTO {
    return {
      id: data.id,
      title: data.title,
      flag: Transformers.toFlagDTO(data.flag),
      components: data.markingComponents.map((x) =>
        Transformers.toAssessmentCriterionDTO(x),
      ),
      studentSubmissionDeadline: data.defaultStudentSubmissionDeadline,
      markerSubmissionDeadline: data.markerSubmissionDeadline,
      weight: data.defaultWeight,
      isOpen: data.open,
      allowedMarkerTypes: data.allowedMarkerTypes,
    };
  }

  public static toGradeEntryDTO(
    this: void,
    data: DB_GradeEntry,
  ): GradeEntryDTO {
    return {
      grade: data.grade,
      comment: data.comment,
      method: data.method,
      timestamp: data.timestamp,
    };
  }

  public static toUnitGradeDTO(
    this: void,
    data: DB_UnitOfAssessmentGrade & { gradeEntries: DB_GradeEntry[] },
  ): UnitGradeDTO {
    return {
      studentSubmitted: data.submitted,
      customDueDate: data.customDueDate ?? undefined,
      customWeight: data.customWeight ?? undefined,
      status: data.status,
      grades: data.gradeEntries.map((e) => Transformers.toGradeEntryDTO(e)),
    };
  }

  public static toSubmissionInfo(
    this: void,
    data: DB_UnitOfAssessmentGrade,
  ): StudentSubmissionInfoDTO {
    return {
      studentSubmitted: data.submitted,
      customDueDate: data.customDueDate ?? undefined,
      customWeight: data.customWeight ?? undefined,
    };
  }

  public static toGroupDTO(this: void, group: DB_AllocationGroup): GroupDTO {
    return { group: group.id, displayName: group.displayName };
  }

  public static toSubGroupDTO(
    this: void,
    subGroup: DB_AllocationSubGroup,
  ): SubGroupDTO {
    return {
      group: subGroup.allocationGroupId,
      subGroup: subGroup.id,
      displayName: subGroup.displayName,
    };
  }
}

export class ReadingPreferenceTransformers {
  public static toExtended(
    type: ExtendedReaderPreferenceType | undefined,
  ): ExtendedReaderPreferenceType {
    switch (type) {
      case DB_ReaderPreferenceType.PREFERRED:
        return ExtendedReaderPreferenceType.PREFERRED;
      case DB_ReaderPreferenceType.UNACCEPTABLE:
        return ExtendedReaderPreferenceType.UNACCEPTABLE;
      default:
        return ExtendedReaderPreferenceType.ACCEPTABLE;
    }
  }

  public static fromExtended(
    type: ExtendedReaderPreferenceType,
  ): DB_ReaderPreferenceType | undefined {
    switch (type) {
      case ExtendedReaderPreferenceType.ACCEPTABLE:
        return undefined;
      case ExtendedReaderPreferenceType.PREFERRED:
        return DB_ReaderPreferenceType.PREFERRED;
      case ExtendedReaderPreferenceType.UNACCEPTABLE:
        return DB_ReaderPreferenceType.UNACCEPTABLE;
    }
  }
}
