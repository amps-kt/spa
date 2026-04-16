import { Grade } from "@/logic/grading";
import { addWeeks, formatDate } from "date-fns";
import { notFound } from "next/navigation";
import { NextResponse } from "next/server";
import { unparse } from "papaparse";

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
  grade?: string;
  comments?: string;
  markingDueOn: string;
  weight: number;
};

type DoublyMarkedUnitRow = {
  supervisorGrade?: string;
  supervisorComments?: string;
  readerGrade?: string;
  readerComments?: string;

  requiredNegotiation: boolean;
  negotiatedGrade?: string;
  negotiatedComment?: string;

  requiredModeration: boolean;
  moderatedGrade?: string;
  moderationComments?: string;

  markingDueOn: string;
  weight: number;
  finalGrade?: string;
};

function capitalise(str: string) {
  return String(str).charAt(0).toUpperCase() + String(str).slice(1);
}

function annotate(prefix: string, data: Record<PropertyKey, unknown>) {
  return Object.fromEntries(
    Object.entries(data).map(([k, v]) => [`${prefix}${capitalise(k)}`, v]),
  );
}

function annotateSingle(unitTitle: string, data: SinglyMarkedUnitRow) {
  return annotate(unitTitle, data);
}

function annotateDouble(unitTitle: string, data: DoublyMarkedUnitRow) {
  return annotate(unitTitle, data);
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
  return sub ? extractComments(components, sub) : undefined;
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
            ? addWeeks(u.grade?.customDueDate, 2)
            : u.unit.markerSubmissionDeadline;

          const markingDueOn = formatDate(markingDueOnDate, "yyyy-MM-dd");

          const weight = u.grade?.customWeight ?? u.unit.weight;

          const grade = Grade.tryToLetter(u.grade?.grades.at(0)?.grade);
          const sub = u.submissions.at(0);
          const comments = tryExtractComments(components, sub);
          return annotateSingle(title, {
            grade,
            comments,
            markingDueOn,
            weight,
          });
        } else {
          const markingDueOnDate = u.grade?.customDueDate
            ? addWeeks(u.grade?.customDueDate, 2)
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

          const negotiateGradeObj = u.grade?.grades.find(
            (x) => x.method === ConsensusMethod.NEGOTIATED,
          );

          const negotiatedGrade = Grade.tryToLetter(negotiateGradeObj?.grade);
          const negotiatedComment = negotiateGradeObj?.comment;

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

          const finalGrade = Grade.tryToLetter(u.grade?.grades.at(0)?.grade);

          return annotateDouble(title, {
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
          });
        }
        // unreachable
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
