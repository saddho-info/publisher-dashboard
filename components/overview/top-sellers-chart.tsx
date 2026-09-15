import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { AnalyticsIcon } from "@/components/dashboard/icons";
import { formatCount } from "@/lib/overview/format";
import type { OverviewTopBook } from "@/lib/overview/types";

export function TopSellersChart({
  books,
  showAnalyticsLink = true,
}: {
  books: OverviewTopBook[];
  showAnalyticsLink?: boolean;
}) {
  const maxSold = books.reduce((max, book) => Math.max(max, book.sold), 0);

  return (
    <Card className="overflow-hidden">
      <CardHeader>
        <CardTitle>Top sellers</CardTitle>
        <CardDescription>
          Which books sell best? Best-performing titles in the selected period.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {books.length === 0 ? (
          <EmptyState
            className="border-0 bg-muted/40 py-10 shadow-none"
            title="No sales to chart"
            description="Top sellers fill in after libraries confirm sales."
            icon={<AnalyticsIcon className="size-6 text-muted-foreground" />}
            action={
              showAnalyticsLink ? (
                <Link
                  href="/analytics"
                  className="text-xs font-medium text-primary hover:underline"
                >
                  Open analytics
                </Link>
              ) : (
                <Link
                  href="/sales"
                  className="text-xs font-medium text-primary hover:underline"
                >
                  View sales
                </Link>
              )
            }
          />
        ) : (
          <ul className="flex flex-col gap-3" aria-label="Top selling books">
            {books.map((book) => {
              const width =
                maxSold > 0 ? Math.max((book.sold / maxSold) * 100, 4) : 0;
              return (
                <li key={book.editionId} className="flex flex-col gap-1">
                  <div className="flex items-baseline justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">
                        {book.bookTitle}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">
                        {book.editionLabel}
                      </p>
                    </div>
                    <span className="shrink-0 text-xs tabular-nums text-muted-foreground">
                      {formatCount(book.sold)}
                    </span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-primary"
                      style={{ width: `${width}%` }}
                    />
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </CardContent>
      {books.length > 0 && showAnalyticsLink ? (
        <CardFooter>
          <Link
            href="/analytics"
            className="text-xs font-medium text-primary hover:underline"
          >
            Full analytics
          </Link>
        </CardFooter>
      ) : null}
    </Card>
  );
}
