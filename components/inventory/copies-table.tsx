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
import { formatCopyNumber } from "@/lib/inventory/format";
import type { InventoryCopy, PaginationMeta } from "@/lib/inventory/types";

export function CopiesTable({
  copies,
  detailBase = "/inventory/copies",
}: {
  copies: InventoryCopy[];
  detailBase?: string;
}) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Copy</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Location</TableHead>
          <TableHead>QR token</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {copies.map((copy) => (
          <TableRow key={copy.id}>
            <TableCell>
              <Link
                href={`${detailBase}/${copy.id}`}
                className="font-medium text-foreground hover:text-primary hover:underline"
              >
                {formatCopyNumber(copy.copyNumber)}
              </Link>
            </TableCell>
            <TableCell>
              <StatusPill status={copy.status} />
            </TableCell>
            <TableCell className="text-muted-foreground">
              {copy.library?.name ?? "Publisher warehouse"}
            </TableCell>
            <TableCell className="max-w-[12rem] truncate font-mono text-xs text-muted-foreground">
              {copy.qrToken ?? "—"}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

export function CopiesPagination({
  meta,
  pathname,
  query,
}: {
  meta: PaginationMeta;
  pathname: string;
  query: Record<string, string>;
}) {
  if (meta.totalPages <= 1) {
    return null;
  }

  function href(page: number) {
    const params = new URLSearchParams(query);
    params.set("page", String(page));
    return `${pathname}?${params.toString()}`;
  }

  return (
    <nav
      className="flex items-center justify-between text-sm text-muted-foreground"
      aria-label="Copy list pages"
    >
      <p>
        Page {meta.page} of {meta.totalPages} · {meta.total} copies
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
