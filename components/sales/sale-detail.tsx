import Link from "next/link";
import type { ReactNode } from "react";
import { PageHeader } from "@/components/dashboard/page-header";
import { buttonClassName } from "@/components/ui/button-styles";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatBookFormat, formatIsbn13 } from "@/lib/books/format";
import { formatCopyNumber } from "@/lib/inventory/format";
import { formatMoney, formatSaleDate } from "@/lib/sales/format";
import type { SaleDetail } from "@/lib/sales/types";

export function SaleDetailView({ sale }: { sale: SaleDetail }) {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={sale.code}
        description={`Sold at ${sale.library.name}`}
        actions={
          <Link
            href="/sales"
            className={buttonClassName({ variant: "outline" })}
          >
            All sales
          </Link>
        }
      />

      <section className="grid gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(16rem,1fr)]">
        <Card>
          <CardHeader>
            <CardTitle>Sale</CardTitle>
            <CardDescription>
              Recorded by library staff. Inventory was decremented when this
              sale was confirmed.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <Field
              label="Library"
              value={
                <Link
                  href={`/libraries/${sale.library.id}`}
                  className="text-primary hover:underline"
                >
                  {sale.library.name}
                </Link>
              }
            />
            <Field label="Sold at" value={formatSaleDate(sale.soldAt)} />
            <Field
              label="Recorded by"
              value={`${sale.actor.firstName} ${sale.actor.lastName}`}
            />
            <Field
              label="Total"
              value={formatMoney(sale.totalCents, sale.currency)}
            />
            {sale.notes ? <Field label="Notes" value={sale.notes} /> : null}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p>
              <span className="text-muted-foreground">Copies · </span>
              {sale.itemCount}
            </p>
            <p>
              <span className="text-muted-foreground">Currency · </span>
              {sale.currency}
            </p>
          </CardContent>
        </Card>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-base font-semibold">Line items</h2>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Copy</TableHead>
              <TableHead>Edition</TableHead>
              <TableHead className="text-right">Price</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sale.items.map((item) => (
              <TableRow key={item.id}>
                <TableCell>
                  <Link
                    href={`/books/${item.edition.book.id}`}
                    className="font-medium hover:text-primary hover:underline"
                  >
                    {item.edition.book.title}
                  </Link>
                  <p className="text-xs text-muted-foreground">
                    {item.edition.book.authors}
                  </p>
                </TableCell>
                <TableCell className="tabular-nums">
                  <Link
                    href={`/inventory/copies/${item.copy.id}`}
                    className="hover:text-primary hover:underline"
                  >
                    {formatCopyNumber(item.copy.copyNumber)}
                  </Link>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {formatBookFormat(item.edition.format)} ·{" "}
                  {formatIsbn13(item.edition.isbn)}
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  {formatMoney(item.unitPriceCents, sale.currency)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </section>
    </div>
  );
}

function Field({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5 sm:flex-row sm:gap-3">
      <dt className="w-28 shrink-0 text-muted-foreground">{label}</dt>
      <dd className="min-w-0">{value}</dd>
    </div>
  );
}
