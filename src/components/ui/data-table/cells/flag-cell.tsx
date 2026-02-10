import { type FlagDTO } from "@/dto";

import { Badge } from "../../badge";

export function FlagCell({ flag }: { flag: FlagDTO }) {
  return (
    <div className="grid w-40 place-items-center">
      <Badge variant="accent" className="rounded-md">
        {flag.displayName}
      </Badge>
    </div>
  );
}
