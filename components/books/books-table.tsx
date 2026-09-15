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
import type { BookListItem, PaginationMeta } from "@/lib/books/types";

export function BooksTable({ books }: { books: BookListItem[] }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Title</TableHead>
          <TableHead>Authors</TableHead>
          <TableHead>Category</TableHead>
          <TableHead className="text-right">Editions</TableHead>
          <TableHead>Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {books.map((book) => (
          <TableRow key={book.id}>
            <TableCell>
              <Link
                href={`/books/${book.id}`}
                className="font-medium text-foreground hover:text-primary hover:underline"
              >
                {book.title}
              </Link>
              {book.subtitle ? (
                <p className="text-xs text-muted-foreground">{book.subtitle}</p>
              ) : null}
            </TableCell>
            <TableCell className="text-muted-foreground">{book.authors}</TableCell>
            <TableCell className="text-muted-foreground">
              {book.category ?? "—"}
            </TableCell>
            <TableCell className="text-right tabular-nums">
              {book._count.editions}
            </TableCell>
            <TableCell>
              <Badge variant={book.isActive ? "success" : "muted"}>
                {book.isActive ? "Active" : "Inactive"}
              </Badge>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

export function BooksPagination({
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
    return `/books?${params.toString()}`;
  }

  return (
    <nav
      className="flex items-center justify-between text-sm text-muted-foreground"
      aria-label="Book list pages"
    >
      <p>
        Page {meta.page} of {meta.totalPages} · {meta.total} titles
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
