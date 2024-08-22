import { ArrowUpLeft } from "lucide-react";
import Link from "next/link";

import { PageWrapper } from "@/components/page-wrapper";

export default async function NotFound() {
  return (
    <PageWrapper className="flex h-full flex-col items-center justify-center bg-background px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-md text-center">
        <div className="mx-auto h-12 w-12 text-primary" />
        <h1 className="mt-4 text-4xl font-bold tracking-tight text-foreground sm:text-4xl">
          Oops, page not found!
        </h1>
        <p className="mt-4 text-muted-foreground">
          The page you are looking for does not exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
            prefetch={false}
          >
            <ArrowUpLeft className="h-4 w-4" />
            <span>Go to Homepage</span>
          </Link>
        </div>
      </div>
    </PageWrapper>
  );
}
