import { ShieldXIcon } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";

export default function UnauthorisedPage() {
  return (
    <div className="h-[calc(100dvh-var(--header-height)*3)] flex items-center justify-center bg-background">
      <div className="max-w-md w-full mx-auto text-center px-6">
        <div className="mb-8">
          <ShieldXIcon className="mx-auto h-24 w-24 text-destructive" />
        </div>

        <h1 className="text-4xl font-bold text-foreground mb-4">
          401 - Unauthorised
        </h1>

        <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
          You are not allowed to access this resource at this time
        </p>

        <div className="space-y-4">
          <Button asChild className="w-full">
            <Link href=".">Go Back Home</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
