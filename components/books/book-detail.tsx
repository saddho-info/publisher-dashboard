import Link from "next/link";
import { EditionPerformanceKpis } from "@/components/analytics/edition-performance/edition-performance-kpis";
import { EditionPerformanceTable } from "@/components/analytics/edition-performance/edition-performance-table";
import { RetryReportButton } from "@/components/analytics/edition-performance/retry-report-button";
import { Badge } from "@/components/ui/badge";
import { buttonClassName } from "@/components/ui/button-styles";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PageHeader } from "@/components/dashboard/page-header";
import {
  formatBookFormat,
  formatIsbn13,
  formatMoney,
  formatPublicationDate,
} from "@/lib/books/format";
import type { BookDetail } from "@/lib/books/types";
import { editionPerformanceHref } from "@/lib/edition-performance/constants";
import type { EditionPerformanceReport } from "@/lib/edition-performance/types";

export type BookEditionPerformance = {
  editionId: string;
  report: EditionPerformanceReport | null;
  errorMessage: string | null;
};

export function BookDetailView({
  book,
  editionPerformance = [],
}: {
  book: BookDetail;
  editionPerformance?: BookEditionPerformance[];
}) {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={book.title}
        description={
          book.subtitle
            ? `${book.subtitle} · ${book.authors}`
            : book.authors
        }
        actions={
          <div className="flex flex-wrap gap-2">
            <Link
              href={`/books/${book.id}/edit`}
              className={buttonClassName({ variant: "outline" })}
            >
              Edit book
            </Link>
            <Link
              href={`/books/${book.id}/editions/new`}
              className={buttonClassName()}
            >
              Add edition
            </Link>
          </div>
        }
      />

      <div className="flex flex-wrap items-center gap-2">
        <Badge variant={book.isActive ? "success" : "muted"}>
          {book.isActive ? "Active" : "Inactive"}
        </Badge>
        {book.category ? <Badge variant="outline">{book.category}</Badge> : null}
        <Badge variant="muted">{book.language}</Badge>
        <span className="text-xs text-muted-foreground">/{book.slug}</span>
      </div>

      {book.editions.length > 0 ? (
        <section
          className="flex flex-col gap-4"
          aria-labelledby="edition-analytics-heading"
        >
          <div>
            <h2
              id="edition-analytics-heading"
              className="text-base font-semibold"
            >
              Edition analytics
            </h2>
            <p className="text-sm text-muted-foreground">
              Where this title sits and sells.
            </p>
          </div>

          {editionPerformance.map(({ editionId, report, errorMessage }) => {
            const edition = book.editions.find((item) => item.id === editionId);
            if (!edition) {
              return null;
            }

            const editionLabel = `${formatBookFormat(edition.format)} · ISBN ${formatIsbn13(edition.isbn)}`;
            return (
              <article
                key={editionId}
                aria-label={`${editionLabel} analytics`}
                className="flex flex-col gap-4 rounded-lg border border-border p-4"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h3 className="font-medium text-foreground">
                      {edition.title || formatBookFormat(edition.format)}
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      {editionLabel}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Link
                      href={`/sales?editionId=${editionId}`}
                      className="self-center text-sm font-medium text-primary hover:underline"
                    >
                      View sales for this edition
                    </Link>
                    <Link
                      href={editionPerformanceHref(editionId)}
                      className={buttonClassName({
                        variant: "outline",
                        size: "sm",
                      })}
                    >
                      Full report
                    </Link>
                  </div>
                </div>

                {report ? (
                  <>
                    <EditionPerformanceKpis summary={report.summary} />
                    {report.libraries.length > 0 ? (
                      <EditionPerformanceTable libraries={report.libraries} />
                    ) : (
                      <EmptyState
                        title="No library activity for this edition"
                        description="This edition has not been distributed or sold through a partner library yet."
                      />
                    )}
                  </>
                ) : errorMessage ? (
                  <ErrorState
                    title="Edition analytics failed to load"
                    message={errorMessage}
                    action={<RetryReportButton />}
                    className="py-8"
                  />
                ) : null}
              </article>
            );
          })}
        </section>
      ) : null}

      <section className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold">Editions</h2>
          <Link
            href={`/books/${book.id}/editions/new`}
            className="text-sm font-medium text-primary hover:underline"
          >
            Add edition
          </Link>
        </div>

        {book.editions.length === 0 ? (
          <EmptyState
            title="No editions yet"
            description="Add a hardcover or paperback with an ISBN before you generate copies."
            action={
              <Link
                href={`/books/${book.id}/editions/new`}
                className={buttonClassName()}
              >
                Add edition
              </Link>
            }
          />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ISBN</TableHead>
                <TableHead>Format</TableHead>
                <TableHead>Published</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {book.editions.map((edition) => (
                <TableRow key={edition.id}>
                  <TableCell className="font-mono text-xs">
                    {formatIsbn13(edition.isbn)}
                    {edition.title ? (
                      <p className="font-sans text-xs text-muted-foreground">
                        {edition.title}
                      </p>
                    ) : null}
                  </TableCell>
                  <TableCell>{formatBookFormat(edition.format)}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatPublicationDate(edition.publicationDate)}
                  </TableCell>
                  <TableCell className="tabular-nums">
                    {formatMoney(edition.listPriceCents, edition.currency)}
                  </TableCell>
                  <TableCell>
                    <Badge variant={edition.isActive ? "success" : "muted"}>
                      {edition.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-3">
                      <Link
                        href={`/inventory/${edition.id}`}
                        className="text-sm font-medium text-primary hover:underline"
                      >
                        Stock
                      </Link>
                      <Link
                        href={`/books/${book.id}/editions/${edition.id}/edit`}
                        className="text-sm font-medium text-primary hover:underline"
                      >
                        Edit
                      </Link>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </section>

      <section className="grid gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(16rem,1fr)]">
        <Card>
          <CardHeader>
            <CardTitle>About this title</CardTitle>
            <CardDescription>
              Catalog metadata used by inventory and distribution.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            {book.description ? (
              <p className="whitespace-pre-wrap text-foreground">
                {book.description}
              </p>
            ) : (
              <p className="text-muted-foreground">No description yet.</p>
            )}
            <dl className="grid gap-2 sm:grid-cols-2">
              <div>
                <dt className="text-xs text-muted-foreground">Publisher</dt>
                <dd>{book.publisher.name}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">Editions</dt>
                <dd>{book._count.editions}</dd>
              </div>
            </dl>
          </CardContent>
        </Card>

        <Card className="overflow-hidden">
          <CardHeader>
            <CardTitle>Cover</CardTitle>
          </CardHeader>
          <CardContent>
            {book.coverImageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={book.coverImageUrl}
                alt={`Cover of ${book.title}`}
                className="mx-auto max-h-64 rounded-md border border-border object-cover"
              />
            ) : (
              <p className="text-sm text-muted-foreground">
                No cover URL. Add one when editing the book or an edition.
              </p>
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
