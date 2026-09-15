import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/dashboard/page-header";
import { DistributionFilters } from "@/components/distribution/distribution-filters";
import { DistributionKpis } from "@/components/distribution/distribution-kpis";
import {
  DistributionsPagination,
  DistributionsTable,
} from "@/components/distribution/distributions-table";
import { buttonClassName } from "@/components/ui/button-styles";
import { EmptyState } from "@/components/ui/empty-state";
import { requirePublisherSession } from "@/lib/auth/session";
import {
  getDistributionSummary,
  getDistributions,
} from "@/lib/distribution/get-distributions";
import {
  canWriteDistributions,
  type DistributionStatus,
} from "@/lib/distribution/types";
import { getLibraries } from "@/lib/libraries/get-libraries";

export const metadata: Metadata = {
  title: "Distribution",
};

export default async function DistributionPage({
  searchParams,
}: {
  searchParams: Promise<{
    search?: string;
    status?: string;
    libraryId?: string;
    page?: string;
  }>;
}) {
  const user = await requirePublisherSession();
  const params = await searchParams;
  const search = params.search?.trim() ?? "";
  const statusParam = params.status ?? "all";
  const libraryId = params.libraryId?.trim() ?? "";
  const page = Math.max(1, Number(params.page) || 1);
  const status =
    statusParam === "DRAFT" ||
    statusParam === "DISPATCHED" ||
    statusParam === "PARTIALLY_RECEIVED" ||
    statusParam === "RECEIVED" ||
    statusParam === "CANCELLED"
      ? (statusParam as DistributionStatus)
      : "all";
  const canWrite = canWriteDistributions(user.role);

  const [summary, result, libraries] = await Promise.all([
    getDistributionSummary({
      search: search || undefined,
      status,
      libraryId: libraryId || undefined,
    }),
    getDistributions({
      page,
      limit: 20,
      search: search || undefined,
      status,
      libraryId: libraryId || undefined,
    }),
    getLibraries({ page: 1, limit: 100, isActive: true }),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Distribution"
        description="Allocate warehouse copies and dispatch them to partner libraries."
        actions={
          canWrite ? (
            <Link href="/distribution/new" className={buttonClassName()}>
              New shipment
            </Link>
          ) : null
        }
      />

      <DistributionKpis summary={summary} />

      <DistributionFilters
        search={search}
        status={statusParam}
        libraryId={libraryId}
        libraries={libraries.data}
      />

      {result.data.length === 0 ? (
        <EmptyState
          title={
            search || status !== "all" || libraryId
              ? "No matching shipments"
              : "No shipments yet"
          }
          description={
            search || status !== "all" || libraryId
              ? "Try a different search or status filter."
              : "Create a shipment to allocate warehouse copies to a linked library, then dispatch to put them in transit."
          }
          action={
            canWrite ? (
              <Link href="/distribution/new" className={buttonClassName()}>
                New shipment
              </Link>
            ) : undefined
          }
        />
      ) : (
        <>
          <DistributionsTable distributions={result.data} />
          <DistributionsPagination
            meta={result.meta}
            query={{ search, status: statusParam, libraryId }}
          />
        </>
      )}
    </div>
  );
}
