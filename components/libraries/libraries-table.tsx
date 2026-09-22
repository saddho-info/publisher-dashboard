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
import {
  formatCount,
  formatDistributionDate,
  formatOptionalCount,
  libraryInStock,
  librarySold,
} from "@/lib/libraries/format";
import type { LibraryListItem, PaginationMeta } from "@/lib/libraries/types";

export function LibrariesTable({ libraries }: { libraries: LibraryListItem[] }) {
  return (
    <>
      <div className="grid gap-3 md:hidden">
        {libraries.map((library) => (
          <LedgerStack
            key={library.id}
            href={`/libraries/${library.id}`}
            title={library.name}
            meta={
              <div className="flex flex-wrap gap-1">
                <Badge variant={library.link?.isActive ? "success" : "warning"}>
                  {library.link?.isActive ? "Linked" : "Paused"}
                </Badge>
                <Badge variant={library.isActive ? "success" : "muted"}>
                  {library.isActive ? "Active" : "Inactive"}
                </Badge>
              </div>
            }
            items={[
              {
                label: "Last sent",
                value:
                  library.lastDistributionId && library.lastDispatchedAt ? (
                    <Link
                      href={`/distribution/${library.lastDistributionId}`}
                      className="hover:text-primary hover:underline"
                    >
                      {formatDistributionDate(library.lastDispatchedAt)}
                    </Link>
                  ) : (
                    formatDistributionDate(library.lastDispatchedAt)
                  ),
              },
              {
                label: "Distributed",
                value: formatOptionalCount(library.totalDistributed),
              },
              {
                label: "In stock",
                value: formatCount(libraryInStock(library)),
              },
              {
                label: "Sold",
                value: formatCount(librarySold(library)),
              },
              {
                label: "Sales",
                value: (
                  <StackedRevenue
                    revenue={library.revenueByCurrency}
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
          <TableHead>Library</TableHead>
          <TableHead>Last sent</TableHead>
          <TableHead className="text-right">Distributed</TableHead>
          <TableHead className="text-right">In stock</TableHead>
          <TableHead className="text-right">Sold</TableHead>
          <TableHead className="text-right">Sales</TableHead>
          <TableHead>
            <span className="sr-only">Open</span>
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {libraries.map((library) => {
          const lastSent = formatDistributionDate(library.lastDispatchedAt);
          return (
            <TableRow key={library.id}>
              <TableCell>
                <Link
                  href={`/libraries/${library.id}`}
                  className="font-medium text-foreground hover:text-primary hover:underline"
                >
                  {library.name}
                </Link>
                <div className="mt-1 flex flex-wrap gap-1">
                  <Badge variant={library.link?.isActive ? "success" : "warning"}>
                    {library.link?.isActive ? "Linked" : "Paused"}
                  </Badge>
                  <Badge variant={library.isActive ? "success" : "muted"}>
                    {library.isActive ? "Active" : "Inactive"}
                  </Badge>
                </div>
              </TableCell>
              <TableCell className="tabular-nums text-muted-foreground">
                {library.lastDistributionId && library.lastDispatchedAt ? (
                  <Link
                    href={`/distribution/${library.lastDistributionId}`}
                    className="hover:text-primary hover:underline"
                  >
                    {lastSent}
                  </Link>
                ) : (
                  lastSent
                )}
              </TableCell>
              <TableCell className="text-right tabular-nums">
                {formatOptionalCount(library.totalDistributed)}
              </TableCell>
              <TableCell className="text-right tabular-nums">
                {formatCount(libraryInStock(library))}
              </TableCell>
              <TableCell className="text-right tabular-nums">
                {formatCount(librarySold(library))}
              </TableCell>
              <TableCell className="text-right">
                <StackedRevenue revenue={library.revenueByCurrency} />
              </TableCell>
              <TableCell>
                <Link
                  href={`/libraries/${library.id}`}
                  className={buttonClassName({ variant: "outline", size: "sm" })}
                >
                  View
                </Link>
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
