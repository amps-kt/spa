import { type ReactNode } from "react";

import { forbidden } from "@/lib/routing";
import { api } from "@/lib/trpc/server";

export default async function Layout({ children }: { children: ReactNode }) {
  const access = await api.institution.isSuperAdmin();
  if (!access) forbidden();

  return <>{children}</>;
}
