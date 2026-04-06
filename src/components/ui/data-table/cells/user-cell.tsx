import { ClassValue } from "clsx";

import { UserDTO } from "@/dto";

import { cn } from "@/lib/utils";

import { WithTooltip } from "../../tooltip-wrapper";

export function UserCell({
  user,
  className,
}: {
  user: UserDTO;
  className?: ClassValue;
}) {
  return (
    <div className={cn(className)}>
      <div className="ml-4">{user.name}</div>
      <div className="ml-4 font-sm text-muted-foreground">{user.id}</div>
      <WithTooltip tip={user.email}>
        <div className="ml-4 text-sm text-muted-foreground w-30 truncate underline decoration-dotted">
          {user.email}
        </div>
      </WithTooltip>
    </div>
  );
}
