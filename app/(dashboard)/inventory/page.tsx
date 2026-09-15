import type { Metadata } from "next";
import Link from "next/link";
import { InventoryFilters } from "@/components/inventory/inventory-filters";
import { InventoryKpis } from "@/components/inventory/inventory-kpis";
import {
  InventoryPagination,
  InventoryTable,
} from "@/components/inventory/inventory-table";
import { PageHeader } from "@/components/dashboard/page-header";
import { buttonClassName } from "@/components/ui/button-styles";
import { EmptyState } from "@/components/ui/empty-state";
import { StatusPill } from "@/components/ui/status-pill";
import {
  getInventory,
  getInventorySummary,
  getLowStock,
} from "@/lib/inventory/get-inventory";

export const metadata: Metadata = {
  title: "Inventory",
};

export default async function InventoryPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; stock?: string; page?: string }>;
}) {
  const params = await searchParams;
  const search = params.search?.trim() ?? "";
  const stock = params.stock === "low" ? "low" : "all";
  const page = Math.max(1, Number(params.page) || 1);

  const [summary, result, lowStock] = await Promise.all([
    getInventorySummary(),
    getInventory({
      page,
      limit: 20,
      search: search || undefined,
      lowStock: stock === "low",
    }),
    getLowStock(5),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Inventory"
        description="Unit-level copies, QR tokens, and warehouse aggregates for this publisher."
        actions={
          <Link href="/books" className={buttonClassName({ variant: "outline" })}>
            Open catalog
          </Link>
        }
      />

      <InventoryKpis summary={summary} />

      {lowStock.data.length > 0 && stock !== "low" ? (
        <div className="flex flex-wrap items-center gap-2 rounded-lg border border-warning/30 bg-warning/5 px-4 py-3 text-sm">
          <StatusPill status="LOW_STOCK" />
          <p className="text-foreground">
            {lowStock.data.length} edition
            {lowStock.data.length === 1 ? "" : "s"} at or below threshold.
          </p>
          <Link
            href="/inventory?stock=low"
            className="font-medium text-primary hover:underline"
          >
            View low stock
          </Link>
        </div>
      ) : null}

      <InventoryFilters search={search} stock={stock} />

      {result.data.length === 0 ? (
        <EmptyState
          title={search || stock === "low" ? "No matching editions" : "No inventory yet"}
          description={
            search || stock === "low"
              ? "Try a different search or stock filter."
              : "Add a book edition, then generate copies to create warehouse stock and QR tokens."
          }
          action={
            <Link href="/books" className={buttonClassName()}>
              Go to books
            </Link>
          }
        />
      ) : (
        <>
          <InventoryTable rows={result.data} />
          <InventoryPagination
            meta={result.meta}
            query={{ search, stock }}
          />
        </>
      )}
    </div>
  );
}
