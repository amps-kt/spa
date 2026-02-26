import { ClassValue } from "clsx";

import { type StudentDTO } from "@/dto";

import { AppInstanceLink } from "@/lib/routing";
import { cn } from "@/lib/utils";

import { Badge } from "../../badge";
import { buttonVariants } from "../../button";

export function StudentCell({
  student,
  className,
}: {
  student: StudentDTO;
  className?: ClassValue;
}) {
  return (
    <div className={cn(className)}>
      <AppInstanceLink
        className={buttonVariants({ variant: "link" })}
        page="studentById"
        linkArgs={{ studentId: student.id }}
      >
        {student.name}
      </AppInstanceLink>
      <div className="ml-4 font-sm text-muted-foreground">{student.id}</div>
      <div className="ml-4 text-sm text-muted-foreground">{student.email}</div>
    </div>
  );
}
export function StudentBadge({
  student,
  className,
}: {
  student: StudentDTO;
  className?: ClassValue;
}) {
  return (
    <Badge
      variant="accent"
      className={cn("rounded-md flex justify-start gap-2 w-max", className)}
    >
      <p className="font-sm ">{student.id}</p>
      <p className="text-muted-foreground">{student.name}</p>
    </Badge>
  );
}
