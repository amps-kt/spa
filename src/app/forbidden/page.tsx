import { ShieldXIcon } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";

export default function ForbiddenPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="max-w-md w-full mx-auto text-center px-6">
        <div className="mb-8">
          <ShieldXIcon className="mx-auto h-24 w-24 text-destructive" />
        </div>

        <h1 className="text-4xl font-bold text-foreground mb-4">
          403 - Forbidden
        </h1>

        <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
          You don&apos;t have access to this page. Please contact your
          administrator if you believe this is an error.
        </p>

        <div className="space-y-4">
          <Button asChild className="w-full">
            <Link href="/">Go Back Home</Link>
          </Button>

          <Button variant="outline" asChild className="w-full bg-transparent">
            <Link href="/contact">Contact Support</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
