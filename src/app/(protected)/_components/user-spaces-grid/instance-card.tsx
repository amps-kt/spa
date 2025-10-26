import { UsersIcon, ChevronRightIcon } from "lucide-react";

import { type InstanceDisplayData } from "@/dto";

import { type Role } from "@/db/types";

import { RoleBadge } from "@/components/role-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function InstanceCard({
  instanceData,
}: {
  instanceData: InstanceDisplayData;
}) {
  return (
    <Card className="group cursor-pointer transition-all hover:scale-[1.02] hover:shadow-lg">
      <CardHeader className="pb-3">
        <div className="mb-2 flex items-center space-x-2">
          <UsersIcon className="h-5 w-5 text-gray-600" />
          <CardTitle className="text-xl font-semibold">
            {instanceData.instance.displayName}
          </CardTitle>
        </div>
        <div className="space-y-2 text-sm text-gray-600">
          <div>{instanceData.subGroup.displayName}</div>
          <div>{instanceData.group.displayName}</div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="mb-4 mt-2 flex flex-wrap gap-2">
          {instanceData.roles.map((role: Role) => (
            <RoleBadge key={role} role={role} />
          ))}
        </div>
        <Button
          variant="outline"
          className="w-full transition-colors group-hover:bg-primary group-hover:text-primary-foreground hover:bg-primary hover:text-primary-foreground"
        >
          Enter Instance
          <ChevronRightIcon className="ml-2 h-4 w-4" />
        </Button>
      </CardContent>
    </Card>
  );
}
