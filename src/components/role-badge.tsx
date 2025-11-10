import { cva } from "class-variance-authority";

import { Role } from "@/db/types";

import { Badge } from "./ui/badge";

export const roleBadgeVariants = cva("", {
  variants: {
    variant: {
      [Role.ADMIN]: "bg-orange-100 text-orange-800",
      [Role.SUPERVISOR]: "bg-blue-100 text-blue-800",
      [Role.READER]: "bg-purple-100 text-purple-800",
      [Role.STUDENT]: "bg-green-100 text-green-800",
    },
  },
});

const roleLabel = {
  [Role.ADMIN]: "Admin",
  [Role.SUPERVISOR]: "Supervisor",
  [Role.READER]: "Reader",
  [Role.STUDENT]: "Student",
};

export function RoleBadge({ role }: { role: Role }) {
  return (
    <Badge key={role} className={roleBadgeVariants({ variant: role })}>
      {roleLabel[role]}
    </Badge>
  );
}
