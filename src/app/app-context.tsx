import { type ReactNode } from "react";

import { NuqsAdapter } from "nuqs/adapters/next/app";

import { Toaster } from "@/components/ui/sonner";

import { TRPCReactProvider } from "@/lib/trpc/client";

export function AppContext({ children }: { children: ReactNode }) {
  return (
    <NuqsAdapter>
      <TRPCReactProvider>
        {children}
        <Toaster position="bottom-right" />
      </TRPCReactProvider>
    </NuqsAdapter>
  );
}
