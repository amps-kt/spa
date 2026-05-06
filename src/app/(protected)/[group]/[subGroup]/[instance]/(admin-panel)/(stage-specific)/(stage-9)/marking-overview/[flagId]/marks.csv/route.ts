import { Grade } from "@/logic/grading";
import { addWeeks, formatDate } from "date-fns";
import { notFound } from "next/navigation";
import { NextResponse } from "next/server";
import { unparse } from "papaparse";

import { DEFAULT_MARKING_DURATION } from "@/config/grades";

import { type MarkingComponentDTO, type MarkingSubmissionDTO } from "@/dto";

import { ConsensusMethod, ConsensusStage } from "@/db/types";

import { redirect } from "@/lib/routing";
import { api } from "@/lib/trpc/server";
import { type InstanceParams } from "@/lib/validations/params";

interface CSVRowBase {
  studentGUID: string;
  studentName: string;
  studentFlag: string;
  studentEmail: string;
  projectTitle: string;

  supervisorName: string;
  supervisorEmail: string;
  readerName?: string;
  readerEmail?: string;

  moderatorName?: string;
  moderatorEmail?: string;

  overallGrade?: string;
  penalty?: string;
}

type SinglyMarkedUnitRow = {
  grade: string | undefined;
  comments: string | undefined;
  markingDueOn: string;
  weight: number;
  submitted: boolean;
};

type DoublyMarkedUnitRow = {
  supervisorGrade: string | undefined;
  supervisorComments: string | undefined;
  readerGrade: string | undefined;
  readerComments: string | undefined;

  requiredNegotiation: boolean;
  negotiatedGrade: string | undefined;
  negotiatedComment: string | undefined;

  requiredModeration: boolean;
  moderatedGrade: string | undefined;
  moderationComments: string | undefined;

  markingDueOn: string;
  weight: number;
  finalGrade: string | undefined;
  submitted: boolean;
};

function capitalise(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function annotate<T extends Record<PropertyKey, unknown>>(
  prefix: string,
  data: T,
) {
  return Object.fromEntries(
    Object.entries(data).map(([k, v]) => [`${prefix}${capitalise(k)}`, v]),
  );
}

function extractComments(
  components: MarkingComponentDTO[],
  sub: MarkingSubmissionDTO,
): string {
  const unitComments = components.map(
    ({ id }) => sub.marks[id]?.justification ?? "",
  );
  return unitComments.join("\n").concat("\n", sub.finalComment ?? "");
}

function tryExtractComments(
  components: MarkingComponentDTO[],
  sub?: MarkingSubmissionDTO,
): string | undefined {
  return sub !== undefined ? extractComments(components, sub) : undefined;
}

export async function GET(
  _request: Request,
  {
    params: { flagId, ...params },
  }: { params: InstanceParams & { flagId: string } },
) {
  const isAdmin = await api.ac.isAdminInInstance({ params });
  if (!isAdmin) return redirect("unauthorised", undefined);

  if (
    !(await api.institution.instance.getFlags({ params }))
      .map((f) => f.id)
      .includes(flagId)
  ) {
    notFound();
  }

  const studentMarkingStatus =
    await api.msp.admin.instance.getStudentMarkingStatus({ params, flagId });

  const data = studentMarkingStatus.map(
    ({ student, project, supervisor, reader, units, finalGrade }) => {
      const unitRows = units.map((u) => {
        const { title, components } = u.unit;

        if (u.unit.allowedMarkerTypes.length === 1) {
          const markingDueOnDate = u.grade?.customDueDate
            ? addWeeks(u.grade?.customDueDate, DEFAULT_MARKING_DURATION.weeks)
            : u.unit.markerSubmissionDeadline;

          const markingDueOn = formatDate(markingDueOnDate, "yyyy-MM-dd");

          const weight = u.grade?.customWeight ?? u.unit.weight;

          const grade =
            weight === 0
              ? "MV"
              : Grade.tryToLetter(u.grade?.grades.at(0)?.grade);
          const sub = u.submissions.at(0);
          const comments = tryExtractComments(components, sub);
          const submitted = u.grade?.studentSubmitted ?? false;

          return annotate<SinglyMarkedUnitRow>(title, {
            grade,
            comments,
            markingDueOn,
            weight,
            submitted,
          });
        } else {
          const markingDueOnDate = u.grade?.customDueDate
            ? addWeeks(u.grade?.customDueDate, DEFAULT_MARKING_DURATION.weeks)
            : u.unit.markerSubmissionDeadline;

          const markingDueOn = formatDate(markingDueOnDate, "yyyy-MM-dd");

          const weight = u.grade?.customWeight ?? u.unit.weight;

          const supervisorSub = u.submissions.find(
            (x) => x.markerId === supervisor.id,
          );

          const supervisorGrade = Grade.tryToLetter(supervisorSub?.grade);
          const supervisorComments = tryExtractComments(
            components,
            supervisorSub,
          );

          const readerSub = u.submissions.find(
            (x) => x.markerId === reader?.id,
          );

          const readerGrade = Grade.tryToLetter(readerSub?.grade);
          const readerComments = tryExtractComments(components, readerSub);

          const requiredNegotiation =
            u.grade?.status === ConsensusStage.NEGOTIATE ||
            (u.grade?.grades.some(
              (x) => x.method === ConsensusMethod.NEGOTIATED,
            ) ??
              false);

          const negotiatedGradeObj = u.grade?.grades.find(
            (x) => x.method === ConsensusMethod.NEGOTIATED,
          );

          const negotiatedGrade = Grade.tryToLetter(negotiatedGradeObj?.grade);
          const negotiatedComment = negotiatedGradeObj?.comment;

          const requiredModeration =
            u.grade?.status === ConsensusStage.MODERATE ||
            u.grade?.status === ConsensusStage.MODERATE_AFTER_NEGOTIATION ||
            (u.grade?.grades.some(
              (x) =>
                x.method === ConsensusMethod.MODERATED ||
                x.method === ConsensusMethod.NEGOTIATED_MODERATED,
            ) ??
              false);

          const moderatedGradeObj = u.grade?.grades.find(
            (x) =>
              x.method === ConsensusMethod.MODERATED ||
              x.method === ConsensusMethod.NEGOTIATED_MODERATED,
          );

          const moderatedGrade = Grade.tryToLetter(moderatedGradeObj?.grade);
          const moderationComments = moderatedGradeObj?.comment;

          const finalGrade =
            weight === 0
              ? "MV"
              : Grade.tryToLetter(u.grade?.grades.at(0)?.grade);

          const submitted = u.grade?.studentSubmitted ?? false;

          return annotate<DoublyMarkedUnitRow>(title, {
            supervisorGrade,
            supervisorComments,
            readerGrade,
            readerComments,

            requiredNegotiation,
            negotiatedGrade,
            negotiatedComment,

            requiredModeration,
            moderatedGrade,
            moderationComments,

            markingDueOn,
            weight,
            finalGrade,
            submitted,
          });
        }
      });

      const base: CSVRowBase = {
        studentGUID: student.id,
        studentName: student.name,
        studentFlag: student.flag.displayName,
        studentEmail: student.email,
        projectTitle: project.title,

        supervisorName: supervisor.name,
        supervisorEmail: supervisor.email,
        readerName: reader?.name,
        readerEmail: reader?.email,

        moderatorName: undefined,
        moderatorEmail: undefined,

        penalty: undefined,
        overallGrade: Grade.tryToLetter(finalGrade),
      };

      return unitRows.reduce((acc, val) => ({ ...acc, ...val }), base);
    },
  );

  const csvText = unparse(data);

  return new NextResponse(csvText);
}
