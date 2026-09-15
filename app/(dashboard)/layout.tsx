import type { ReactNode } from "react";
import { DashboardShell } from "@/components/dashboard/shell";
import { requirePublisherSession } from "@/lib/auth/session";

export default async function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const user = await requirePublisherSession();
  return <DashboardShell user={user}>{children}</DashboardShell>;
}
