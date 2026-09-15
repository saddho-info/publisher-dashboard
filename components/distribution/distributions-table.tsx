import Link from "next/link";
import { StatusPill } from "@/components/ui/status-pill";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  formatCount,
  formatDistributionDate,
} from "@/lib/distribution/format";
import type {
  DistributionListItem,
  PaginationMeta,
} from "@/lib/distribution/types";

export function DistributionsTable({
  distributions,
}: {
  distributions: DistributionListItem[];
}) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Shipment</TableHead>
          <TableHead>Library</TableHead>
          <TableHead className="text-right">Copies</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Created</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {distributions.map((row) => (
          <TableRow key={row.id}>
            <TableCell>
              <Link
                href={`/distribution/${row.id}`}
                className="font-medium text-foreground hover:text-primary hover:underline"
              >
                {row.code}
              </Link>
              <p className="text-xs text-muted-foreground">
                {row.itemCount} edition{row.itemCount === 1 ? "" : "s"}
              </p>
            </TableCell>
            <TableCell>
              <Link
                href={`/libraries/${row.library.id}`}
                className="text-foreground hover:text-primary hover:underline"
              >
                {row.library.name}
              </Link>
            </TableCell>
            <TableCell className="text-right tabular-nums">
              {formatCount(row.totalQuantity)}
            </TableCell>
            <TableCell>
              <StatusPill status={row.status} />
            </TableCell>
            <TableCell className="text-muted-foreground">
              {formatDistributionDate(row.dispatchedAt ?? row.createdAt)}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

export function DistributionsPagination({
  meta,
  query,
}: {
  meta: PaginationMeta;
  query: { search: string; status: string; libraryId: string };
}) {
  if (meta.totalPages <= 1) {
    return null;
  }

  function href(page: number) {
    const params = new URLSearchParams();
    if (query.search) params.set("search", query.search);
    if (query.status) params.set("status", query.status);
    if (query.libraryId) params.set("libraryId", query.libraryId);
    params.set("page", String(page));
    return `/distribution?${params.toString()}`;
  }

  return (
    <nav
      className="flex items-center justify-between text-sm text-muted-foreground"
      aria-label="Distribution list pages"
    >
      <p>
        Page {meta.page} of {meta.totalPages} · {meta.total} shipments
      </p>
      <div className="flex gap-2">
        {meta.page > 1 ? (
          <Link href={href(meta.page - 1)} className="hover:text-foreground">
            Previous
          </Link>
        ) : (
          <span className="opacity-40">Previous</span>
        )}
        {meta.page < meta.totalPages ? (
          <Link href={href(meta.page + 1)} className="hover:text-foreground">
            Next
          </Link>
        ) : (
          <span className="opacity-40">Next</span>
        )}
      </div>
    </nav>
  );
}
