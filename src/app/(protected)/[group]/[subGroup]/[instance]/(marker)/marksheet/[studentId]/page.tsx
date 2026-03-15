import { Marksheet } from "@/components/marking/marksheet";
import { PanelWrapper } from "@/components/panel-wrapper";

import { api } from "@/lib/trpc/server";
import { type InstanceParams } from "@/lib/validations/params";

type PageParams = InstanceParams & { studentId: string };

export default async function MarksheetPage({
  params: { studentId, ...params },
}: {
  params: PageParams;
}) {
  const { student, units } = await api.user.newMarker.getStudentMarkingData({
    params,
    studentId,
  });

  const { supervisor, reader } = await api.msp.marker.project.getMarkers({
    params,
    studentId,
  });

  return (
    <PanelWrapper>
      <Marksheet
        student={student}
        units={units}
        supervisor={supervisor}
        reader={reader}
        params={params}
      />
    </PanelWrapper>
  );
}
