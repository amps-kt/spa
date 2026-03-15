import { type ClassValue } from "clsx";
import { XIcon } from "lucide-react";

import { type StudentDTO } from "@/dto";

import { Badge } from "@/components/ui/badge";

import { cn } from "@/lib/utils";

export function StudentBadge({
  student,
  className,
  onClick,
}: {
  student: StudentDTO;
  className?: ClassValue;
  onClick?: () => void;
}) {
  return (
    <Badge
      variant="accent"
      className={cn(
        "rounded-md flex justify-start gap-2 w-max hover:bg-primary/10 pointer-events-none",

        className,
      )}
    >
      <p className="font-sm ">{student.id}</p>
      <p className="text-muted-foreground">{student.name}</p>
      {onClick && (
        <XIcon
          className="cursor-pointer size-4 rounded-full pointer-events-auto"
          onClick={onClick}
        />
      )}
    </Badge>
  );
}
