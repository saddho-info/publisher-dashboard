import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CopyFilters } from "@/components/inventory/copy-filters";
import {
  CopiesPagination,
  CopiesTable,
} from "@/components/inventory/copies-table";
import {
  GenerateCopiesForm,
  ThresholdForm,
} from "@/components/inventory/generate-copies-form";
import { MovementsTable } from "@/components/inventory/movements-table";
import { PageHeader } from "@/components/dashboard/page-header";
import { buttonClassName } from "@/components/ui/button-styles";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { StatusPill } from "@/components/ui/status-pill";
import { ApiError } from "@/lib/api/server";
import { formatBookFormat, formatIsbn13, formatMoney } from "@/lib/books/format";
import { getEdition } from "@/lib/books/get-books";
import { formatCount } from "@/lib/inventory/format";
import {
  getCopies,
  getInventory,
  getMovements,
} from "@/lib/inventory/get-inventory";
import type { CopyStatus } from "@/lib/inventory/types";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ editionId: string }>;
}): Promise<Metadata> {
  const { editionId } = await params;
  try {
    const edition = await getEdition(editionId);
    return { title: `${edition.book.title} inventory` };
  } catch {
    return { title: "Edition inventory" };
  }
}

export default async function EditionInventoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ editionId: string }>;
  searchParams: Promise<{ status?: string; page?: string }>;
}) {
  const { editionId } = await params;
  const query = await searchParams;
  const status = (query.status as CopyStatus | "all" | undefined) ?? "all";
  const page = Math.max(1, Number(query.page) || 1);

  const edition = await getEdition(editionId).catch((error: unknown) => {
    if (error instanceof ApiError && error.status === 404) {
      notFound();
    }
    throw error;
  });

  const [rollups, copies, movements] = await Promise.all([
    getInventory({ editionId, limit: 1 }),
    getCopies({
      editionId,
      page,
      limit: 20,
      status,
    }),
    getMovements({ editionId, limit: 8 }),
  ]);

  const rollup = rollups.data[0];

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={edition.book.title}
        description={`${formatBookFormat(edition.format)} · ${formatIsbn13(edition.isbn)}`}
        actions={
          <div className="flex flex-wrap gap-2">
            <Link
              href={`/books/${edition.book.id}`}
              className={buttonClassName({ variant: "outline" })}
            >
              View book
            </Link>
            <Link
              href={`/distribution/new?editionId=${editionId}`}
              className={buttonClassName()}
            >
              Distribute
            </Link>
            <Link href="/inventory" className={buttonClassName({ variant: "ghost" })}>
              All inventory
            </Link>
          </div>
        }
      />

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardHeader>
            <CardDescription>Warehouse</CardDescription>
            <CardTitle className="text-2xl tabular-nums">
              {formatCount(rollup?.warehouseOnHand ?? 0)}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>At libraries</CardDescription>
            <CardTitle className="text-2xl tabular-nums">
              {formatCount(rollup?.libraryOnHand ?? 0)}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Sold</CardDescription>
            <CardTitle className="text-2xl tabular-nums">
              {formatCount(rollup?.sold ?? 0)}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>List price</CardDescription>
            <CardTitle className="text-2xl">
              {formatMoney(edition.listPriceCents, edition.currency)}
            </CardTitle>
          </CardHeader>
        </Card>
      </section>

      {rollup?.isLowStock ? (
        <div className="flex items-center gap-2 text-sm">
          <StatusPill status="LOW_STOCK" />
          <span className="text-muted-foreground">
            Warehouse is at or below the reorder threshold (
            {formatCount(rollup.lowStockThreshold)}).
          </span>
        </div>
      ) : null}

      <section className="grid gap-4 lg:grid-cols-[minmax(0,1.2fr)_minmax(16rem,0.8fr)]">
        <Card>
          <CardHeader>
            <CardTitle>Print copies</CardTitle>
            <CardDescription>
              Each copy gets a unique QR token. Tokens are opaque — they do not
              embed the copy id or ISBN.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <GenerateCopiesForm editionId={editionId} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Reorder point</CardTitle>
            <CardDescription>
              Low-stock alerts use this warehouse threshold.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ThresholdForm
              editionId={editionId}
              current={rollup?.lowStockThreshold ?? 5}
            />
          </CardContent>
        </Card>
      </section>

      <section className="flex flex-col gap-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <h2 className="text-base font-semibold">Copies</h2>
          <CopyFilters
            status={status}
            pathname={`/inventory/${editionId}`}
          />
        </div>
        {copies.data.length === 0 ? (
          <EmptyState
            title="No copies yet"
            description="Generate a print run to create warehouse units and QR tokens."
          />
        ) : (
          <>
            <CopiesTable copies={copies.data} />
            <CopiesPagination
              meta={copies.meta}
              pathname={`/inventory/${editionId}`}
              query={status !== "all" ? { status } : {}}
            />
          </>
        )}
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-base font-semibold">Recent movements</h2>
        {movements.data.length === 0 ? (
          <EmptyState
            title="No movements"
            description="Print runs, distributions, and sales will appear here."
          />
        ) : (
          <MovementsTable movements={movements.data} />
        )}
      </section>
    </div>
  );
}
