import Link from "next/link";
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
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead scope="col">Library</TableHead>
          <TableHead scope="col" className="text-right">
            Total distributed
          </TableHead>
          <TableHead scope="col" className="text-right">
            Current stock
          </TableHead>
          <TableHead scope="col" className="text-right">
            In transit
          </TableHead>
          <TableHead scope="col" className="text-right">
            Sold
          </TableHead>
          <TableHead scope="col" className="text-right">
            Total sales
          </TableHead>
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
  );
}
