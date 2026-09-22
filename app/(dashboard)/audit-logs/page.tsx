import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/dashboard/page-header";
import { AuditFilters } from "@/components/reports/audit-filters";
import { AuditLogsTable, AuditPagination } from "@/components/reports/audit-logs-table";
import { EmptyState } from "@/components/ui/empty-state";
import { buttonClassName } from "@/components/ui/button-styles";
import { requireSuperAdmin } from "@/lib/auth/roles";
import { getAuditLogs, reportDownloadHref } from "@/lib/reports/get-reports";

export const metadata: Metadata = { title: "Audit Logs" };

export default async function AuditLogsPage({ searchParams }: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  await requireSuperAdmin();
  const params = await searchParams;
  const query = {
    search: params.search?.trim() ?? "",
    entityType: params.entityType?.trim() ?? "",
    entityId: params.entityId?.trim() ?? "",
    action: params.action?.trim() ?? "",
  };
  const result = await getAuditLogs({
    page: Math.max(1, Number(params.page) || 1),
    limit: 20,
    search: query.search || undefined,
    entityType: query.entityType || undefined,
    entityId: query.entityId || undefined,
    action: query.action || undefined,
  });
  return <div className="flex flex-col gap-6">
    <PageHeader title="Audit Logs" description="Review authenticated activity and mutations across the platform." actions={
      <Link href={reportDownloadHref("audit-logs.csv", {
        search: query.search || undefined,
        entityType: query.entityType || undefined,
        entityId: query.entityId || undefined,
        action: query.action || undefined,
      })} className={buttonClassName({ variant: "outline" })}>Export CSV</Link>
    } />
    <AuditFilters {...query} />
    {result.data.length ? <><AuditLogsTable rows={result.data} /><AuditPagination meta={result.meta} query={query} baseHref="/audit-logs" /></> :
      <EmptyState title="No matching audit events" description="Try changing the filters. New platform activity appears here automatically." />}
  </div>;
}
