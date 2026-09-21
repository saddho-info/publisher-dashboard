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
import { formatCount } from "@/lib/publishers/format";
import type { PaginationMeta, PublisherListItem } from "@/lib/publishers/types";

export function PublishersTable({
  publishers,
}: {
  publishers: PublisherListItem[];
}) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Publisher</TableHead>
          <TableHead>Contact</TableHead>
          <TableHead className="text-right">Staff</TableHead>
          <TableHead>Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {publishers.map((publisher) => (
          <TableRow key={publisher.id}>
            <TableCell>
              <Link
                href={`/publishers/${publisher.id}`}
                className="font-medium text-foreground hover:text-primary hover:underline"
              >
                {publisher.name}
              </Link>
              <p className="text-xs text-muted-foreground">/{publisher.slug}</p>
            </TableCell>
            <TableCell className="text-muted-foreground">
              {publisher.email ?? publisher.phone ?? "—"}
            </TableCell>
            <TableCell className="text-right tabular-nums">
              {formatCount(publisher._count.users)}
            </TableCell>
            <TableCell>
              <Badge variant={publisher.isActive ? "success" : "muted"}>
                {publisher.isActive ? "Active" : "Inactive"}
              </Badge>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

export function PublishersPagination({
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
    return `/publishers?${params.toString()}`;
  }

  return (
    <nav
      className="flex items-center justify-between text-sm text-muted-foreground"
      aria-label="Publisher list pages"
    >
      <p>
        Page {meta.page} of {meta.totalPages} · {meta.total} publishers
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
