import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatCount } from "@/lib/libraries/format";
import type { LibraryListItem, PaginationMeta } from "@/lib/libraries/types";

export function LibrariesTable({ libraries }: { libraries: LibraryListItem[] }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Library</TableHead>
          <TableHead>Contact</TableHead>
          <TableHead className="text-right">On hand</TableHead>
          <TableHead className="text-right">Staff</TableHead>
          <TableHead>Partnership</TableHead>
          <TableHead>Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {libraries.map((library) => (
          <TableRow key={library.id}>
            <TableCell>
              <Link
                href={`/libraries/${library.id}`}
                className="font-medium text-foreground hover:text-primary hover:underline"
              >
                {library.name}
              </Link>
              <p className="text-xs text-muted-foreground">/{library.slug}</p>
            </TableCell>
            <TableCell className="text-muted-foreground">
              {library.email ?? library.phone ?? "—"}
            </TableCell>
            <TableCell className="text-right tabular-nums">
              {formatCount(library.stock.onHand)}
            </TableCell>
            <TableCell className="text-right tabular-nums">
              {formatCount(library._count.users)}
            </TableCell>
            <TableCell>
              <Badge variant={library.link?.isActive ? "success" : "warning"}>
                {library.link?.isActive ? "Linked" : "Paused"}
              </Badge>
            </TableCell>
            <TableCell>
              <Badge variant={library.isActive ? "success" : "muted"}>
                {library.isActive ? "Active" : "Inactive"}
              </Badge>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

export function LibrariesPagination({
  meta,
  query,
}: {
  meta: PaginationMeta;
  query: { search: string; isActive: string };
}) {
  if (meta.totalPages <= 1) {
    return null;
  }

  function href(page: number) {
    const params = new URLSearchParams();
    if (query.search) params.set("search", query.search);
    if (query.isActive) params.set("isActive", query.isActive);
    params.set("page", String(page));
    return `/libraries?${params.toString()}`;
  }

  return (
    <nav
      className="flex items-center justify-between text-sm text-muted-foreground"
      aria-label="Library list pages"
    >
      <p>
        Page {meta.page} of {meta.totalPages} · {meta.total} libraries
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
