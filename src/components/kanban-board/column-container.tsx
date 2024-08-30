"use client";
import { useMemo } from "react";
import { useDroppable } from "@dnd-kit/core";
import { SortableContext } from "@dnd-kit/sortable";
import { Stage } from "@prisma/client";

import { useInstanceStage } from "@/components/params-context";

import { cn } from "@/lib/utils";
import { stageGte } from "@/lib/utils/permissions/stage-check";
import { BoardColumn, ProjectPreference } from "@/lib/validations/board";

import { ProjectPreferenceCard } from "./project-preference-card";

export function ColumnContainer({
  column,
  projects,
  deletePreference,
}: {
  column: BoardColumn;
  projects: ProjectPreference[];
  deletePreference: (id: string) => Promise<void>;
}) {
  const stage = useInstanceStage();
  const projectIds = useMemo(() => projects.map((e) => e.id), [projects]);

  const { setNodeRef, isOver } = useDroppable({
    id: column.id,
    data: {
      type: "Column",
      column,
    },
    disabled: stageGte(stage, Stage.PROJECT_ALLOCATION),
  });

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "flex h-full min-h-60 w-full flex-col gap-4 rounded-md bg-accent/50 px-3.5 pb-10 shadow-sm",
        isOver && "outline outline-4 outline-muted-foreground/50",
      )}
    >
      <p className="mx-3 mb-3 mt-5 text-2xl font-medium underline decoration-secondary underline-offset-4">
        {column.displayName}
      </p>
      <SortableContext items={projectIds}>
        {projects.map((e, i) => (
          <ProjectPreferenceCard
            key={e.id}
            project={e}
            idx={i + 1}
            deletePreference={deletePreference}
          />
        ))}
      </SortableContext>
    </div>
  );
}
