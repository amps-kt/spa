import { format } from "date-fns";

export function DisplayDeadline({ deadline }: { deadline: Date }) {
  return (
    <p className="flex gap-2 text-xl">
      {format(deadline, "dd MMM yyyy - HH:mm")}
      <span className="text-muted-foreground">{format(deadline, "OOOO")}</span>
    </p>
  );
}
