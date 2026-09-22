import Link from "next/link";
import { LedgerStack } from "@/components/libraries/ledger-stack";
import { StackedRevenue } from "@/components/libraries/stacked-revenue";
import { Badge } from "@/components/ui/badge";
import { buttonClassName } from "@/components/ui/button-styles";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatOptionalCount } from "@/lib/libraries/format";
import type { BookListItem, PaginationMeta } from "@/lib/books/types";

export function BooksTable({ books }: { books: BookListItem[] }) {
  return (
    <>
      <div className="grid gap-3 md:hidden">
        {books.map((book) => (
          <LedgerStack
            key={book.id}
            href={`/books/${book.id}`}
            title={book.title}
            meta={
              <p className="text-xs text-muted-foreground">{book.authors}</p>
            }
            items={[
              {
                label: "In libraries",
                value: formatOptionalCount(book.libraryStock),
              },
              { label: "Sold", value: formatOptionalCount(book.sold) },
              {
                label: "Sales",
                value: (
                  <StackedRevenue
                    revenue={book.revenueByCurrency}
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
          <TableHead>Title</TableHead>
          <TableHead>Authors</TableHead>
          <TableHead className="text-right">In libraries</TableHead>
          <TableHead className="text-right">Sold</TableHead>
          <TableHead className="text-right">Sales</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Analytics</TableHead>
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
              {book.category ? (
                <p className="text-xs text-muted-foreground">{book.category}</p>
              ) : null}
            </TableCell>
            <TableCell className="text-muted-foreground">{book.authors}</TableCell>
            <TableCell className="text-right tabular-nums">
              {formatOptionalCount(book.libraryStock)}
            </TableCell>
            <TableCell className="text-right tabular-nums">
              {formatOptionalCount(book.sold)}
            </TableCell>
            <TableCell className="text-right">
              <StackedRevenue revenue={book.revenueByCurrency} />
            </TableCell>
            <TableCell>
              <Badge variant={book.isActive ? "success" : "muted"}>
                {book.isActive ? "Active" : "Inactive"}
              </Badge>
            </TableCell>
            <TableCell>
              <Link
                href={`/books/${book.id}`}
                className={buttonClassName({ variant: "outline", size: "sm" })}
              >
                View
              </Link>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
        </Table>
      </div>
    </>
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
