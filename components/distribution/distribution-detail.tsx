import Link from "next/link";
import type { ReactNode } from "react";
import { PageHeader } from "@/components/dashboard/page-header";
import {
  CancelDistributionButton,
  DispatchDistributionButton,
} from "@/components/distribution/distribution-actions";
import { buttonClassName } from "@/components/ui/button-styles";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { StatusPill } from "@/components/ui/status-pill";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatBookFormat, formatIsbn13 } from "@/lib/books/format";
import {
  formatCount,
  formatDistributionDate,
} from "@/lib/distribution/format";
import { formatCopyNumber } from "@/lib/inventory/format";
import type { DistributionDetail } from "@/lib/distribution/types";
import { canWriteDistributions } from "@/lib/distribution/types";

export function DistributionDetailView({
  distribution,
  role,
}: {
  distribution: DistributionDetail;
  role: string;
}) {
  const canWrite = canWriteDistributions(role);
  const isDraft = distribution.status === "DRAFT";

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={distribution.code}
        description={`To ${distribution.library.name}`}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href="/distribution"
              className={buttonClassName({ variant: "outline" })}
            >
              All shipments
            </Link>
            {canWrite && isDraft ? (
              <DispatchDistributionButton
                distributionId={distribution.id}
                code={distribution.code}
              />
            ) : null}
          </div>
        }
      />

      <div className="flex flex-wrap items-center gap-2">
        <StatusPill status={distribution.status} />
        <span className="text-xs text-muted-foreground">
          {formatCount(distribution.totalQuantity)} copies ·{" "}
          {distribution.itemCount} edition
          {distribution.itemCount === 1 ? "" : "s"}
        </span>
      </div>

      <section className="grid gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(16rem,1fr)]">
        <Card>
          <CardHeader>
            <CardTitle>Shipment</CardTitle>
            <CardDescription>
              {distribution.status === "DISPATCHED"
                ? "Copies are in transit until the library confirms receiving."
                : distribution.status === "DRAFT"
                  ? "Drafts do not change warehouse stock until you dispatch."
                  : "This draft was cancelled. Warehouse stock was not moved."}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <Field
              label="Library"
              value={
                <Link
                  href={`/libraries/${distribution.library.id}`}
                  className="text-primary hover:underline"
                >
                  {distribution.library.name}
                </Link>
              }
            />
            <Field
              label="Created"
              value={formatDistributionDate(distribution.createdAt)}
            />
            <Field
              label="Dispatched"
              value={formatDistributionDate(distribution.dispatchedAt)}
            />
            <Field
              label="Prepared by"
              value={`${distribution.actor.firstName} ${distribution.actor.lastName}`}
            />
            <Field label="Notes" value={distribution.notes ?? "—"} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Next step</CardTitle>
            <CardDescription>
              Library receiving lands in Phase 12.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            {isDraft ? (
              <p>
                Dispatch to pick warehouse copies, mark them distributed, and
                increment in-transit at the library.
              </p>
            ) : distribution.status === "DISPATCHED" ? (
              <p>
                The library will review, verify, and confirm this shipment from
                the portal. Inventory on hand updates then.
              </p>
            ) : (
              <p>Create a new shipment if this allocation still needs to go out.</p>
            )}
            {canWrite && isDraft ? (
              <CancelDistributionButton
                distributionId={distribution.id}
                code={distribution.code}
              />
            ) : null}
          </CardContent>
        </Card>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-base font-semibold">Lines</h2>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Edition</TableHead>
              <TableHead className="text-right">Quantity</TableHead>
              <TableHead>Copies</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {distribution.items.map((item) => (
              <TableRow key={item.id}>
                <TableCell>
                  <Link
                    href={`/inventory/${item.edition.id}`}
                    className="font-medium text-foreground hover:text-primary hover:underline"
                  >
                    {item.edition.book.title}
                  </Link>
                  <p className="text-xs text-muted-foreground">
                    {formatBookFormat(item.edition.format)} ·{" "}
                    {formatIsbn13(item.edition.isbn)}
                  </p>
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  {formatCount(item.quantity)}
                </TableCell>
                <TableCell className="text-xs text-muted-foreground">
                  {item.copies.length > 0
                    ? item.copies
                        .map((copy) => formatCopyNumber(copy.copyNumber))
                        .join(", ")
                    : "Assigned on dispatch"}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </section>
    </div>
  );
}

function Field({
  label,
  value,
}: {
  label: string;
  value: string | ReactNode;
}) {
  return (
    <div>
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <div className="mt-0.5 text-foreground">{value}</div>
    </div>
  );
}
