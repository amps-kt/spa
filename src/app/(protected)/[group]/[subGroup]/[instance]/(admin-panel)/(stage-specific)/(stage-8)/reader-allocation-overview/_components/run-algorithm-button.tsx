"use client";

import { useCallback } from "react";

import { CloudCogIcon } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";

import { useAppRouter } from "@/lib/routing";
import { api } from "@/lib/trpc/client";
import { type InstanceParams } from "@/lib/validations/params";

export function RunAlgorithmButton({ params }: { params: InstanceParams }) {
  const router = useAppRouter();
  const { mutateAsync: api_runReaderAllocation, isPending } =
    api.institution.instance.runReaderAllocation.useMutation();

  const run = useCallback(() => {
    void toast
      .promise(api_runReaderAllocation({ params }), {
        loading: "Loading",
        error: "Something went wrong",
        success: "Matching complete",
      })
      .unwrap()
      .then(() => router.refresh());
  }, [api_runReaderAllocation, router, params]);

  return (
    <Button
      disabled={isPending}
      onClick={run}
      variant="outline"
      className="w-50 flex justify-start gap-3"
    >
      <CloudCogIcon className="size-4" />
      Run Algorithm
    </Button>
  );
}
