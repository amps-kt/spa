"use client";

import { Fragment, useEffect } from "react";

import { api } from "@/lib/trpc/client";

import { useInstanceParams } from "./params-context";

export function JoinInstance({ isJoined }: { isJoined: boolean }) {
  const params = useInstanceParams();
  const { mutateAsync: api_joinInstance } = api.user.joinInstance.useMutation();

  useEffect(() => {
    if (!isJoined) void api_joinInstance({ params });
  }, [isJoined, api_joinInstance, params]);

  return <Fragment />;
}
