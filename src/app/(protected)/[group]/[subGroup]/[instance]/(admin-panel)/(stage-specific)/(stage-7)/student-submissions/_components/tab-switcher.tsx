import { useState } from "react";

import { CheckCircle2Icon, ClockIcon, ZapIcon } from "lucide-react";

import { SectionHeading } from "@/components/heading";

import { cn } from "@/lib/utils";

import { ChangeDeadlineAction } from "./mass-actions/change-deadline";
import { MarkAsSubmittedAction } from "./mass-actions/mark-as-submitted";

type TabId = "submitted" | "deadline";

const TABS: {
  id: TabId;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  panel: React.ComponentType;
}[] = [
  {
    id: "submitted",
    label: "Change Submission Status",
    description: "Bulk-change students' submission status for chosen units.",
    icon: CheckCircle2Icon,
    panel: MarkAsSubmittedAction,
  },
  {
    id: "deadline",
    label: "Change Deadlines",
    description: "Set a new due date for chosen units and students.",
    icon: ClockIcon,
    panel: ChangeDeadlineAction,
  },
  // If we need to add a mass action for changing weights it would just go here
];

export function QuickActionsTabSwitcher() {
  const [activeTab, setActiveTab] = useState<TabId | null>(null);

  const activeDefinition = TABS.find((t) => t.id === activeTab) ?? null;
  const ActivePanel = activeDefinition?.panel ?? null;

  return (
    <>
      <section className="flex flex-col gap-6">
        <SectionHeading icon={ZapIcon}>Quick Actions</SectionHeading>
        <p className="tracking-tight text-muted-foreground text-sm">
          To trigger an action you must select a student and unit. You can make
          selections via the Filters menu
        </p>
        <div className="flex gap-2">
          {/* todo: 1. both tabs should be disabled unless ther's a valid selection (so at least one unit and one student) */}
          {/* todo: 2. Now that the actual action panels are so slim, maybe we can stack everything vertically or something? */}
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(isActive ? null : tab.id)}
                className={cn(
                  "group flex flex-1 items-start gap-3 rounded-lg border px-4 py-3 text-left transition-colors",
                  isActive
                    ? "border-indigo-200 bg-indigo-50 text-indigo-900"
                    : "border-border bg-card text-foreground hover:border-indigo-100 hover:bg-indigo-50/40",
                )}
              >
                <div
                  className={cn(
                    "mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md",
                    isActive
                      ? "bg-indigo-100 text-indigo-600"
                      : "bg-muted text-muted-foreground group-hover:bg-indigo-100 group-hover:text-indigo-500",
                  )}
                >
                  <Icon className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <p
                    className={cn(
                      "text-sm font-medium leading-snug",
                      isActive && "text-indigo-800",
                    )}
                  >
                    {tab.label}
                  </p>
                  <p
                    className={cn(
                      "mt-0.5 text-xs leading-relaxed text-muted-foreground",
                      isActive && "text-indigo-600/70",
                    )}
                  >
                    {tab.description}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
        {ActivePanel && activeDefinition && <ActivePanel />}
      </section>
    </>
  );
}
