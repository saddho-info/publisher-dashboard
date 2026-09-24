import type { Metadata } from "next";
import { PageHeader } from "@/components/dashboard/page-header";
import { SalesFilters } from "@/components/sales/sales-filters";
import { SalesKpis } from "@/components/sales/sales-kpis";
import { SalesPagination, SalesTable } from "@/components/sales/sales-table";
import { EmptyState } from "@/components/ui/empty-state";
import { requirePublisherSession } from "@/lib/auth/session";
import { getLibraries } from "@/lib/libraries/get-libraries";
import { getSaleSummary, getSales } from "@/lib/sales/get-sales";

export const metadata: Metadata = {
  title: "Sales",
};

export default async function SalesPage({
  searchParams,
}: {
  searchParams: Promise<{
    search?: string;
    libraryId?: string;
    editionId?: string;
    page?: string;
  }>;
}) {
  await requirePublisherSession();
  const params = await searchParams;
  const search = params.search?.trim() ?? "";
  const libraryId = params.libraryId?.trim() ?? "";
  const editionId = params.editionId?.trim() ?? "";
  const page = Math.max(1, Number(params.page) || 1);

  const [summary, result, libraries] = await Promise.all([
    getSaleSummary({
      search: search || undefined,
      libraryId: libraryId || undefined,
      editionId: editionId || undefined,
    }),
    getSales({
      page,
      limit: 20,
      search: search || undefined,
      libraryId: libraryId || undefined,
      editionId: editionId || undefined,
    }),
    getLibraries({ page: 1, limit: 100, isActive: true }),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Sales"
        description="Partner library sales of your editions. Sales are recorded at the library; this view is read-only."
      />

      <SalesKpis summary={summary} />

      <SalesFilters
        search={search}
        libraryId={libraryId}
        editionId={editionId}
        libraries={libraries.data}
      />

      {result.data.length === 0 ? (
        <EmptyState
          title={
            search || libraryId || editionId ? "No matching sales" : "No sales yet"
          }
          description={
            search || libraryId || editionId
              ? "Try a different search or library filter."
              : "Sales appear here after a partner library sells copies of your editions."
          }
        />
      ) : (
        <>
          <SalesTable sales={result.data} />
          <SalesPagination
            meta={result.meta}
            query={{ search, libraryId, editionId }}
          />
        </>
      )}
    </div>
  );
}
