import Link from "next/link";
import { LedgerStack } from "@/components/libraries/ledger-stack";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  formatRevenueEntries,
  NO_VALUE,
} from "@/lib/edition-performance/format";
import type { LibraryPerformanceRow } from "@/lib/edition-performance/types";
import { formatCount } from "@/lib/overview/format";

export function EditionPerformanceTable({
  libraries,
}: {
  libraries: LibraryPerformanceRow[];
}) {
  return (
    <>
      <div className="grid gap-3 md:hidden">
        {libraries.map((row) => {
          const revenue = formatRevenueEntries(row.revenueByCurrency);
          return (
            <LedgerStack
              key={row.library.id}
              href={`/libraries/${row.library.id}`}
              title={row.library.name}
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
                  value:
                    revenue.length === 0 ? (
                      NO_VALUE
                    ) : (
                      <span className="flex flex-col tabular-nums">
                        {revenue.map((amount) => (
                          <span key={amount}>{amount}</span>
                        ))}
                      </span>
                    ),
                },
              ]}
            />
          );
        })}
      </div>
      <div className="hidden md:block">
        <Table>
      <TableHeader>
        <TableRow>
          <TableHead scope="col">Library</TableHead>
          <TableHead className="text-right">Distributed</TableHead>
          <TableHead className="text-right">In stock</TableHead>
          <TableHead className="text-right">In transit</TableHead>
          <TableHead className="text-right">Sold</TableHead>
          <TableHead className="text-right">Sales</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {libraries.map((row) => {
          const revenue = formatRevenueEntries(row.revenueByCurrency);
          return (
            <TableRow key={row.library.id}>
              <TableCell>
                <Link
                  href={`/libraries/${row.library.id}`}
                  className="font-medium text-foreground hover:text-primary hover:underline"
                >
                  {row.library.name}
                </Link>
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
              <TableCell className="text-right tabular-nums">
                {revenue.length === 0
                  ? NO_VALUE
                  : revenue.map((amount) => (
                      <span key={amount} className="block">
                        {amount}
                      </span>
                    ))}
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
        </Table>
      </div>
    </>
  );
}
