import Link from "next/link";
import { LedgerStack } from "@/components/libraries/ledger-stack";
import { StackedRevenue } from "@/components/libraries/stacked-revenue";
import { LibraryPortalAccess } from "@/components/libraries/library-portal-access";
import { Badge } from "@/components/ui/badge";
import { buttonClassName } from "@/components/ui/button-styles";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { PageHeader } from "@/components/dashboard/page-header";
import { StatusPill } from "@/components/ui/status-pill";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatBookFormat, formatIsbn13, formatMoney } from "@/lib/books/format";
import { canWriteDistributions } from "@/lib/distribution/types";
import type { DistributionListItem } from "@/lib/distribution/types";
import {
  formatCount,
  formatDistributionDate,
  formatLinkedDate,
} from "@/lib/libraries/format";
import {
  canManageLibraries,
  type LibraryDetail,
  type LibraryEditionPerformance,
  type LibraryPublisherPerformance,
} from "@/lib/libraries/types";
import {
  canManageLibraryPortalAccess,
  type LibraryUser,
} from "@/lib/users/types";
import { PartnershipForm } from "./partnership-form";
import { RetryPerformanceButton } from "./retry-performance-button";
import { UnlinkLibraryButton } from "./unlink-library-button";

export function LibraryDetailView({
  library,
  performance,
  performanceError = null,
  editionPerformance = null,
  editionPerformanceError = null,
  shipments = [],
  shipmentsError = null,
  shipmentsTotal = 0,
  role,
  portalUsers = [],
}: {
  library: LibraryDetail;
  performance: LibraryPublisherPerformance | null;
  performanceError?: string | null;
  editionPerformance?: LibraryEditionPerformance | null;
  editionPerformanceError?: string | null;
  shipments?: DistributionListItem[];
  shipmentsError?: string | null;
  shipmentsTotal?: number;
  role: string;
  portalUsers?: LibraryUser[];
}) {
  const canManage = canManageLibraries(role);
  const canDistribute = canWriteDistributions(role);
  const canManagePortal = canManageLibraryPortalAccess(role);
  const showPublisherLedger =
    performance !== null ||
    performanceError !== null ||
    editionPerformance !== null ||
    editionPerformanceError !== null;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={library.name}
        description={library.email ?? `/${library.slug}`}
        actions={
          canManage || canDistribute || canManagePortal ? (
            <div className="flex flex-wrap gap-2">
              {canManage ? (
                <Link
                  href={`/libraries/${library.id}/edit`}
                  className={buttonClassName({ variant: "outline" })}
                >
                  Edit details
                </Link>
              ) : null}
              {canManagePortal ? (
                <Link
                  href={`/libraries/${library.id}/staff/new`}
                  className={buttonClassName({ variant: "outline" })}
                >
                  Add portal account
                </Link>
              ) : null}
              {canDistribute ? (
                <Link
                  href={`/distribution/new?libraryId=${library.id}`}
                  className={buttonClassName()}
                >
                  Distribute stock
                </Link>
              ) : null}
            </div>
          ) : null
        }
      />

      <div className="flex flex-wrap items-center gap-2">
        <Badge variant={library.isActive ? "success" : "muted"}>
          {library.isActive ? "Active" : "Inactive"}
        </Badge>
        {library.link ? (
          <Badge variant={library.link.isActive ? "brand" : "warning"}>
            {library.link.isActive ? "Partnership active" : "Partnership paused"}
          </Badge>
        ) : null}
        <span className="text-xs text-muted-foreground">/{library.slug}</span>
      </div>

      {performance ? (
        <section aria-label="Publisher performance at this library">
          <div className="mb-3">
            <h2 className="text-base font-semibold">Publisher performance</h2>
            <p className="text-sm text-muted-foreground">
              Distribution, current stock, sales, and finalized revenue for
              this publisher only.{" "}
              <Link
                href={`/sales?libraryId=${library.id}`}
                className="font-medium text-primary hover:underline"
              >
                View sales for this library
              </Link>
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
            <StockCard
              label="Total distributed"
              value={performance.summary.totalDistributed}
              hint="Copies sent or assigned"
            />
            <StockCard
              label="In stock"
              value={performance.summary.inStock}
              hint="Copies currently available"
            />
            <StockCard
              label="In transit"
              value={performance.summary.inTransit}
              hint="Dispatched, not yet received"
            />
            <StockCard
              label="Sold"
              value={performance.summary.sold}
              hint="Confirmed unit sales"
            />
            <RevenueCard revenue={performance.summary.revenueByCurrency} />
          </div>
        </section>
      ) : performanceError ? (
        <section aria-label="Publisher performance at this library">
          <ErrorState
            title="Publisher performance failed to load"
            message={performanceError}
            action={<RetryPerformanceButton />}
            className="py-8"
          />
        </section>
      ) : (
        <section aria-label="Stock at this library">
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <StockCard
              label="On hand"
              value={library.stock.onHand}
              hint="Copies received and still held"
            />
            <StockCard
              label="In transit"
              value={library.stock.inTransit}
              hint="Distributed, not yet received"
            />
            <StockCard
              label="Sold"
              value={library.stock.sold}
              hint="Confirmed unit sales"
            />
            <StockCard
              label="Copies"
              value={library.stock.copyCount}
              hint="Physical units assigned here"
            />
          </div>
        </section>
      )}

      {showPublisherLedger ? (
        <BooksAtLibrary
          libraryId={library.id}
          report={editionPerformance}
          error={editionPerformanceError}
          canDistribute={canDistribute}
        />
      ) : null}

      <ShipmentsToLibrary
        libraryId={library.id}
        shipments={shipments}
        error={shipmentsError}
        total={shipmentsTotal}
      />

      <section className="grid gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(16rem,1fr)]">
        <Card>
          <CardHeader>
            <CardTitle>Contact</CardTitle>
            <CardDescription>
              Used when allocating distribution and for library staff login.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <Field label="Email" value={library.email} />
            <Field label="Phone" value={library.phone} />
            <Field label="Address" value={library.address} />
            <Field
              label="Staff accounts"
              value={formatCount(library._count.users)}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Partnership</CardTitle>
            <CardDescription>
              Linked {formatLinkedDate(library.link?.createdAt)}. Use Distribute
              stock to allocate warehouse copies to this library.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {canManage && library.link ? (
              <PartnershipForm library={library} />
            ) : (
              <p className="text-sm text-muted-foreground">
                {library.link?.notes || "No notes on this partnership."}
              </p>
            )}
            {canManage ? (
              <UnlinkLibraryButton
                libraryId={library.id}
                libraryName={library.name}
                publisherId={
                  role === "SUPER_ADMIN"
                    ? (library.link?.publisherId ?? undefined)
                    : undefined
                }
              />
            ) : null}
          </CardContent>
        </Card>
      </section>

      {canManagePortal ? (
        <LibraryPortalAccess libraryId={library.id} users={portalUsers} />
      ) : null}
    </div>
  );
}

function BooksAtLibrary({
  libraryId,
  report,
  error,
  canDistribute,
}: {
  libraryId: string;
  report: LibraryEditionPerformance | null;
  error: string | null;
  canDistribute: boolean;
}) {
  const editions = report
    ? [...report.editions].sort(
        (left, right) =>
          right.inStock - left.inStock || right.sold - left.sold,
      )
    : [];

  return (
    <section className="flex flex-col gap-3" aria-label="Books at this library">
      <div>
        <h2 className="text-base font-semibold">Books at this library</h2>
        <p className="text-sm text-muted-foreground">
          Copies this publisher sent, still holds, and has sold here.
        </p>
      </div>

      {error ? (
        <ErrorState
          title="Books at this library failed to load"
          message={error}
          action={<RetryPerformanceButton />}
          className="py-8"
        />
      ) : editions.length === 0 ? (
        <EmptyState
          title="No copies at this library yet"
          description="Distribute warehouse copies to this library to see stock, sold, and sales here."
          action={
            canDistribute ? (
              <Link
                href={`/distribution/new?libraryId=${libraryId}`}
                className={buttonClassName()}
              >
                Distribute stock
              </Link>
            ) : undefined
          }
        />
      ) : (
        <>
          <div className="grid gap-3 md:hidden">
            {editions.map((row) => (
              <LedgerStack
                key={row.edition.id}
                href={`/books/${row.book.id}`}
                title={row.book.title}
                meta={
                  <p className="text-xs text-muted-foreground">
                    {formatBookFormat(row.edition.format)}
                    {row.edition.title ? ` · ${row.edition.title}` : ""}
                    {` · ISBN ${formatIsbn13(row.edition.isbn)}`}
                  </p>
                }
                items={[
                  {
                    label: "Distributed",
                    value: formatCount(row.totalDistributed),
                  },
                  { label: "In stock", value: formatCount(row.inStock) },
                  { label: "In transit", value: formatCount(row.inTransit) },
                  { label: "Sold", value: formatCount(row.sold) },
                  {
                    label: "Sales",
                    value: (
                      <StackedRevenue
                        revenue={row.revenueByCurrency}
                        align="start"
                      />
                    ),
                  },
                ]}
              />
            ))}
          </div>
          <div className="hidden md:block">
            <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Book</TableHead>
              <TableHead className="text-right">Distributed</TableHead>
              <TableHead className="text-right">In stock</TableHead>
              <TableHead className="text-right">In transit</TableHead>
              <TableHead className="text-right">Sold</TableHead>
              <TableHead className="text-right">Sales</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {editions.map((row) => (
              <TableRow key={row.edition.id}>
                <TableCell>
                  <Link
                    href={`/books/${row.book.id}`}
                    className="font-medium text-foreground hover:text-primary hover:underline"
                  >
                    {row.book.title}
                  </Link>
                  <p className="text-xs text-muted-foreground">
                    {formatBookFormat(row.edition.format)}
                    {row.edition.title ? ` · ${row.edition.title}` : ""}
                    {` · ISBN ${formatIsbn13(row.edition.isbn)}`}
                  </p>
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  {formatCount(row.totalDistributed)}
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  {formatCount(row.inStock)}
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  {formatCount(row.inTransit)}
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  {formatCount(row.sold)}
                </TableCell>
                <TableCell className="text-right">
                  <StackedRevenue revenue={row.revenueByCurrency} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
            </Table>
          </div>
        </>
      )}
    </section>
  );
}

function ShipmentsToLibrary({
  libraryId,
  shipments,
  error,
  total,
}: {
  libraryId: string;
  shipments: DistributionListItem[];
  error: string | null;
  total: number;
}) {
  return (
    <section
      className="flex flex-col gap-3"
      aria-label="Shipments to this library"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold">Shipments to this library</h2>
          <p className="text-sm text-muted-foreground">
            Recent dispatches — when copies were sent.
          </p>
        </div>
        <Link
          href={`/distribution?libraryId=${libraryId}`}
          className="text-sm font-medium text-primary hover:underline"
        >
          View all
        </Link>
      </div>

      {error ? (
        <ErrorState
          title="Shipments failed to load"
          message={error}
          action={<RetryPerformanceButton />}
          className="py-8"
        />
      ) : shipments.length === 0 ? (
        <p className="rounded-lg border border-dashed border-border bg-card px-4 py-6 text-center text-sm text-muted-foreground">
          No shipments to this library yet.
        </p>
      ) : (
        <>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Shipment</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Copies</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {shipments.map((row) => (
                <TableRow key={row.id}>
                  <TableCell>
                    <Link
                      href={`/distribution/${row.id}`}
                      className="font-medium text-foreground hover:text-primary hover:underline"
                    >
                      {row.code}
                    </Link>
                  </TableCell>
                  <TableCell className="tabular-nums text-muted-foreground">
                    {formatDistributionDate(row.dispatchedAt ?? row.createdAt)}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {formatCount(row.totalQuantity)}
                  </TableCell>
                  <TableCell>
                    <StatusPill status={row.status} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {total > shipments.length ? (
            <p className="text-xs text-muted-foreground">
              Showing {shipments.length} of {total} shipments.
            </p>
          ) : null}
        </>
      )}
    </section>
  );
}

function StockCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: number;
  hint: string;
}) {
  return (
    <Card>
      <CardHeader>
        <CardDescription>{label}</CardDescription>
        <CardTitle className="text-2xl tabular-nums">
          {formatCount(value)}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <p className="text-xs text-muted-foreground">{hint}</p>
      </CardContent>
    </Card>
  );
}

function RevenueCard({
  revenue,
}: {
  revenue: LibraryPublisherPerformance["summary"]["revenueByCurrency"];
}) {
  return (
    <Card>
      <CardHeader>
        <CardDescription>Revenue</CardDescription>
        <CardTitle className="text-2xl tabular-nums">
          {revenue[0]
            ? formatMoney(revenue[0].totalCents, revenue[0].currency)
            : "—"}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        {revenue.length > 1 ? (
          <ul className="mb-1 space-y-0.5 text-sm font-medium tabular-nums">
            {revenue.slice(1).map((entry) => (
              <li key={entry.currency}>
                {formatMoney(entry.totalCents, entry.currency)}
              </li>
            ))}
          </ul>
        ) : null}
        <p className="text-xs text-muted-foreground">
          {revenue.length > 1
            ? "Reported separately per currency"
            : "Finalized sales total"}
        </p>
      </CardContent>
    </Card>
  );
}

function Field({ label, value }: { label: string; value: string | null }) {
  return (
    <div>
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <p className="mt-0.5 text-foreground">
        {value && value.length > 0 ? value : "—"}
      </p>
    </div>
  );
}
