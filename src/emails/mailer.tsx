import { type ComponentProps, type ReactElement } from "react";

import { PAUL_EMAIL, tag_coordinator } from "@/config/emails";

import { type ReaderDTO, type SupervisorDTO } from "@/dto";

import { type InstanceParams } from "@/lib/validations/params";

import MarkingComplete from "./messages/marking-lifecycle/marking-complete";
import MarkingReceipt from "./messages/marking-lifecycle/marking-receipt";
import MarkingReset from "./messages/marking-lifecycle/marking-reset";
import ModerationRequired from "./messages/marking-lifecycle/moderation-required";
import NegotiationRequired from "./messages/marking-lifecycle/negotiation-required";
import MarkingOverdueGeneric from "./messages/marking-overdue-generic";
import NegotiationOverdueGeneric from "./messages/negotiation-overdue-generic";
import ExtensionGranted from "./messages/teaching-office/extension-granted";
import MedicalVoidGranted from "./messages/teaching-office/medical-void-granted";
import StudentWithdrawn from "./messages/teaching-office/student-withdrawn";

export type SendMail = ({
  message,
  to,
  subject,
  cc,
}: {
  message: ReactElement;
  subject: string;
  to: string[];
  cc?: string[];
}) => Promise<void>;

export class Mailer {
  private sendMail: SendMail;

  public constructor(sendMail: SendMail) {
    this.sendMail = sendMail;
  }

  public async notifyGenericMarkingOverdue({
    params,
    markers,
  }: {
    params: InstanceParams;
    markers: { email: string }[];
  }) {
    const message = <MarkingOverdueGeneric params={params} />;
    const subject = MarkingOverdueGeneric.makeSubject();

    await Promise.all(
      markers.flatMap((m) => [
        this.sendMail({ message, subject, to: [m.email] }),
        this.sendMail({
          message,
          subject: tag_coordinator(subject, m.email),
          to: [PAUL_EMAIL],
        }),
      ]),
    );
  }

  public async notifyGenericNegotiationOverdue({
    params,
    markers,
  }: {
    params: InstanceParams;
    markers: { email: string }[];
  }) {
    const message = <NegotiationOverdueGeneric params={params} />;
    const subject = NegotiationOverdueGeneric.makeSubject();

    await Promise.all(
      markers.flatMap((m) => [
        this.sendMail({ message, subject, to: [m.email] }),
        this.sendMail({
          message,
          subject: tag_coordinator(subject, m.email),
          to: [PAUL_EMAIL],
        }),
      ]),
    );
  }

  public async notifyMarkingReset(props: ComponentProps<typeof MarkingReset>) {
    const message = <MarkingReset {...props} />;
    const subject = MarkingReset.makeSubject(props);

    await Promise.all([
      this.sendMail({ message, subject, to: [props.marker.email] }),
      this.sendMail({
        message,
        subject: tag_coordinator(subject),
        to: [PAUL_EMAIL],
      }),
    ]);
  }

  public async sendMarkingReceipt(
    props: ComponentProps<typeof MarkingReceipt>,
  ) {
    const message = <MarkingReceipt {...props} />;
    const subject = MarkingReceipt.makeSubject(props);

    await Promise.all([
      this.sendMail({ message, subject, to: [props.marker.email] }),
      this.sendMail({
        message,
        subject: tag_coordinator(subject),
        to: [PAUL_EMAIL],
      }),
    ]);
  }

  public async notifyMarkingComplete(
    props: ComponentProps<typeof MarkingComplete>,
  ) {
    const message = <MarkingComplete {...props} />;
    const subject = MarkingComplete.makeSubject(props);

    const markerEmails = [
      ...(props.reader ? [[props.reader.user.email]] : []),
      ...(props.supervisor ? [[props.supervisor.user.email]] : []),
    ];

    await Promise.all([
      this.sendMail({
        message,
        subject: tag_coordinator(subject),
        to: [PAUL_EMAIL],
      }),
      ...markerEmails.map((to) => this.sendMail({ message, subject, to })),
    ]);
  }

  public async notifyNegotiation(
    props: Omit<ComponentProps<typeof NegotiationRequired>, "isSupervisor">,
  ) {
    const subject = NegotiationRequired.makeSubject(props);

    await Promise.all([
      this.sendMail({
        message: <NegotiationRequired {...props} isSupervisor={false} />,
        subject: tag_coordinator(subject),
        to: [PAUL_EMAIL],
      }),
      this.sendMail({
        message: <NegotiationRequired {...props} isSupervisor={false} />,
        subject,
        to: [props.reader.user.email],
      }),
      this.sendMail({
        message: <NegotiationRequired {...props} isSupervisor={true} />,
        subject,
        to: [props.supervisor.user.email],
      }),
    ]);
  }

  public async notifyModeration(
    props: ComponentProps<typeof ModerationRequired>,
  ) {
    const message = <ModerationRequired {...props} />;
    const subject = ModerationRequired.makeSubject(props);

    await Promise.all([
      this.sendMail({
        message,
        subject: tag_coordinator(subject),
        to: [PAUL_EMAIL],
      }),
      this.sendMail({ message, subject, to: [props.reader.user.email] }),
      this.sendMail({ message, subject, to: [props.supervisor.user.email] }),
    ]);
  }

  public async notifyExtensionGranted(
    props: ComponentProps<typeof ExtensionGranted> & {
      reader: ReaderDTO;
      supervisor: SupervisorDTO;
    },
  ) {
    const message = <ExtensionGranted {...props} />;
    const subject = ExtensionGranted.makeSubject(props);

    await Promise.all([
      this.sendMail({
        message,
        subject: tag_coordinator(subject),
        to: [PAUL_EMAIL],
      }),
      this.sendMail({ message, subject: subject, to: [props.reader.email] }),
      this.sendMail({
        message,
        subject: subject,
        to: [props.supervisor.email],
      }),
    ]);
  }

  public async notifyMedicalVoidGranted(
    props: ComponentProps<typeof MedicalVoidGranted> & {
      reader: ReaderDTO;
      supervisor: SupervisorDTO;
    },
  ) {
    const message = <MedicalVoidGranted {...props} />;
    const subject = MedicalVoidGranted.makeSubject(props);

    await Promise.all([
      this.sendMail({
        message,
        subject: tag_coordinator(subject),
        to: [PAUL_EMAIL],
      }),
      this.sendMail({ message, subject: subject, to: [props.reader.email] }),
      this.sendMail({
        message,
        subject: subject,
        to: [props.supervisor.email],
      }),
    ]);
  }

  public async notifyStudentWithdrawn(
    props: ComponentProps<typeof StudentWithdrawn> & {
      reader: ReaderDTO;
      supervisor: SupervisorDTO;
    },
  ) {
    const message = <StudentWithdrawn {...props} />;
    const subject = StudentWithdrawn.makeSubject(props);

    await Promise.all([
      this.sendMail({
        message,
        subject: tag_coordinator(subject),
        to: [PAUL_EMAIL],
      }),
      this.sendMail({ message, subject: subject, to: [props.reader.email] }),
      this.sendMail({
        message,
        subject: subject,
        to: [props.supervisor.email],
      }),
    ]);
  }

  // public async notifyNegotiationOverdue({
  //   student,
  //   project,
  //   unit,
  //   supervisor,
  //   params,
  //   reader,
  // }: {
  //   project: ProjectDTO;
  //   student: StudentDTO;
  //   unit: UnitOfAssessmentDTO;
  //   reader: ReaderDTO;
  //   supervisor: SupervisorDTO;
  //   params: InstanceParams;
  // }) {
  //   const subject = "Negotiation Overdue";

  //   await Promise.all([
  //     this.sendMail({
  //       message: (
  //         <SupervisorNegotiationOverdue
  //           student={student}
  //           project={project}
  //           unit={unit}
  //           supervisor={supervisor}
  //           params={params}
  //         />
  //       ),
  //       to: [supervisor.email],
  //       subject,
  //     }),
  //     this.sendMail({
  //       message: (
  //         <ReaderNegotiationOverdue
  //           student={student}
  //           project={project}
  //           reader={reader}
  //         />
  //       ),
  //       to: [reader.email],
  //       subject,
  //     }),
  //   ]);
  // }

  // public async notifyModeration({
  //   project,
  //   reader,
  //   student,
  //   unit,
  //   supervisor,
  //   deadline,
  //   criteria,
  //   supervisorSubmission,
  //   readerSubmission,
  //   negotiationResult,
  // }: {
  //   project: ProjectDTO;
  //   reader: ReaderDTO;
  //   student: StudentDTO;
  //   unit: UnitOfAssessmentDTO;
  //   supervisor: SupervisorDTO;
  //   deadline: Date;
  //   criteria: MarkingComponentDTO[];
  //   supervisorSubmission: FullMarkingSubmissionDTO;
  //   readerSubmission: FullMarkingSubmissionDTO;
  //   negotiationResult?: ComponentScoreDTO;
  // }) {
  //   const subject = "Grading Negotiation Required";
  //   await Promise.all([
  //     this.sendMail({
  //       message: (
  //         <CoordinatorModeration
  //           project={project}
  //           reader={reader}
  //           student={student}
  //           unit={unit}
  //           supervisor={supervisor}
  //           deadline={deadline}
  //           criteria={criteria}
  //           supervisorSubmission={supervisorSubmission}
  //           readerSubmission={readerSubmission}
  //           negotiationResult={negotiationResult}
  //         />
  //       ),
  //       subject: tag_coordinator(subject),
  //       to: [PAUL_EMAIL],
  //     }),
  //   ]);
  // }
}
