import { type ClassValue } from "clsx";

import { type FlagDTO } from "@/dto";

import { cn } from "@/lib/utils";

import { Badge } from "../../badge";

export function FlagCell({
  flag,
  className,
}: {
  flag: FlagDTO;
  className?: ClassValue;
}) {
  return (
    <div className={cn("grid w-40 place-items-center", className)}>
      <Badge variant="accent" className="rounded-md">
        {flag.displayName}
      </Badge>
    </div>
  );
}
