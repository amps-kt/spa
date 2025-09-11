"use client";

import { useEffect, useState } from "react";

import { ShieldXIcon } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { usePathInInstance } from "@/components/params-context";
import { Button } from "@/components/ui/button";

export default function ForbiddenPage({
  searchParams: { next },
}: {
  searchParams: { next?: string };
}) {
  const { basePath } = usePathInInstance();
  const [countdown, setCountdown] = useState(10);
  const router = useRouter();

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          router.push(next ?? basePath);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [next, router, basePath]);

  const progress = ((10 - countdown) / 10) * 283;
  // 283 is circumference of circle with radius 45

  return (
    <div className="min-h-[calc(100dvh-var(--header-height)*2)] flex items-center justify-center bg-background">
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

        <div className="mb-8 flex flex-col items-center">
          <div className="relative w-20 h-20 mb-4">
            <svg
              className="w-20 h-20 transform -rotate-90"
              viewBox="0 0 100 100"
            >
              <circle
                cx="50"
                cy="50"
                r="45"
                stroke="currentColor"
                strokeWidth="8"
                fill="transparent"
                className="text-muted-foreground/20"
              />
              <circle
                cx="50"
                cy="50"
                r="45"
                stroke="currentColor"
                strokeWidth="8"
                fill="transparent"
                strokeDasharray="283"
                strokeDashoffset={progress}
                className="text-primary transition-all duration-1000 ease-linear"
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-2xl font-bold text-foreground">
                {countdown}
              </span>
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            Redirecting to home page in {countdown} seconds
          </p>
        </div>

        <div className="space-y-4">
          <Button asChild className="w-full">
            <Link href={next ?? basePath}>Go Back Home</Link>
          </Button>

          <Button variant="outline" asChild className="w-full bg-transparent">
            <Link href="/contact">Contact Support</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
