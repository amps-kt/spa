import { ListTodoIcon } from "lucide-react";

import { SectionHeading } from "./heading";

export function NothingToDo() {
  return (
    <div className="mt-9 flex flex-col gap-4">
      <SectionHeading icon={ListTodoIcon} className="mb-2">
        Task List
      </SectionHeading>
      <p>Nothing to do at this stage</p>
    </div>
  );
}
