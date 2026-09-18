import type { Metadata } from "next";
import { PageHeader } from "@/components/dashboard/page-header";
import { AuditFilters } from "@/components/reports/audit-filters";
import {
  AuditLogsTable,
  AuditPagination,
} from "@/components/reports/audit-logs-table";
import { ReportExportCards } from "@/components/reports/report-export-cards";
import { EmptyState } from "@/components/ui/empty-state";
import { requirePublisherSession } from "@/lib/auth/session";
import { getAuditLogs } from "@/lib/reports/get-reports";

export const metadata: Metadata = {
  title: "Reports",
};

export default async function ReportsPage({
  searchParams,
}: {
  searchParams: Promise<{
    page?: string;
    search?: string;
    entityType?: string;
  }>;
}) {
  await requirePublisherSession();
  const params = await searchParams;
  const search = params.search?.trim() ?? "";
  const entityType = params.entityType?.trim() ?? "";
  const page = Math.max(1, Number(params.page) || 1);

  const audit = await getAuditLogs({
    page,
    limit: 20,
    search: search || undefined,
    entityType: entityType || undefined,
  });

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Reports"
        description="Export inventory and sales, and review inventory-mutating audit events for your publisher."
      />

      <ReportExportCards />

      <section className="flex flex-col gap-3" aria-label="Audit log">
        <h2 className="text-sm font-semibold">Audit log</h2>
        <AuditFilters search={search} entityType={entityType} />

        {audit.data.length === 0 ? (
          <EmptyState
            title={
              search || entityType
                ? "No matching audit events"
                : "No audit events yet"
            }
            description={
              search || entityType
                ? "Try a different search or entity filter."
                : "Sales, distributions, receipts, copy, inventory, and sync mutations appear here."
            }
          />
        ) : (
          <>
            <AuditLogsTable rows={audit.data} />
            <AuditPagination
              meta={audit.meta}
              query={{ search, entityType }}
            />
          </>
        )}
      </section>
    </div>
  );
}