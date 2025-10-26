import { type ReactNode } from "react";

import { api } from "@/lib/trpc/server";
import { forbidden } from "@/lib/utils/redirect";

export default async function Layout({ children }: { children: ReactNode }) {
  const access = await api.institution.isSuperAdmin();
  if (!access) forbidden();

  return <>{children}</>;
}
