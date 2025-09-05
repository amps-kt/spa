import { type ReactNode } from "react";

// eslint-disable-next-line no-restricted-imports
import { Slot } from "@radix-ui/react-slot";

import { type InstanceParams } from "@/lib/validations/params";

import { WithTooltip } from "../ui/tooltip-wrapper";

import { FormatDenials } from "./format-denial";
import { serverSideAC } from "./server-side-ac";
import {
  type AccessCondition,
  type AccessControlContext,
  AccessControlResult,
  type DenialReason,
} from "./types";

interface ServerSideConditionalRenderProps extends AccessCondition {
  allowed: ReactNode;
  denied?: (data: {
    ctx: AccessControlContext;
    reasons: DenialReason[];
  }) => ReactNode;
  loading?: ReactNode;
  error?: ReactNode;
  params: InstanceParams;
}

export async function ServerSideConditionalRender({
  loading,
  error,
  allowed,
  denied,
  params,
  ...conditions
}: ServerSideConditionalRenderProps) {
  const accessState = await serverSideAC(conditions, params);

  if (accessState.status === AccessControlResult.LOADING) {
    return <>{loading ?? null}</>;
  } else if (accessState.status === AccessControlResult.ERROR) {
    return <>{error ?? null}</>;
  }

  return (
    <>
      {accessState.status === AccessControlResult.ALLOWED
        ? allowed
        : denied
          ? denied(accessState)
          : null}
    </>
  );
}

interface ServerSideConditionalDisableProps extends AccessCondition {
  params: InstanceParams;
  children: ReactNode;
}

export function ServerSideConditionalDisable({
  children,
  params,
  ...conditions
}: ServerSideConditionalDisableProps) {
  return (
    <ServerSideConditionalRender
      params={params}
      {...conditions}
      allowed={children}
      denied={(denialData) => (
        <WithTooltip tip={<FormatDenials {...denialData} />}>
          {/* @ts-expect-error trust me bro*/}
          <Slot disabled>{children}</Slot>
        </WithTooltip>
      )}
      loading={
        <WithTooltip tip="Checking Access Control...">
          {/* @ts-expect-error trust me bro*/}
          <Slot disabled>{children}</Slot>
        </WithTooltip>
      }
      error={
        <WithTooltip tip={"Access Control Error"}>
          {/* @ts-expect-error trust me bro*/}
          <Slot disabled>{children}</Slot>
        </WithTooltip>
      }
    />
  );
}
