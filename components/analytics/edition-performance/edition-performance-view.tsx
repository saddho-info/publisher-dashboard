import Link from "next/link";
import { EditionPerformanceKpis } from "@/components/analytics/edition-performance/edition-performance-kpis";
import { EditionPerformanceTable } from "@/components/analytics/edition-performance/edition-performance-table";
import { EditionSearch } from "@/components/analytics/edition-performance/edition-search";
import { RetryReportButton } from "@/components/analytics/edition-performance/retry-report-button";
import { SelectedEditionSummary } from "@/components/analytics/edition-performance/selected-edition-summary";
import { PageHeader } from "@/components/dashboard/page-header";
import { buttonClassName } from "@/components/ui/button-styles";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import type { EditionPerformanceReport } from "@/lib/edition-performance/types";

export function EditionPerformanceView({
  selectedEditionId,
  report,
  errorMessage,
}: {
  selectedEditionId: string;
  report: EditionPerformanceReport | null;
  errorMessage: string | null;
}) {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Edition performance"
        description="Library-wise distribution, stock, and sales for a single book edition."
        actions={
          <Link
            href="/analytics"
            className={buttonClassName({ variant: "outline", size: "sm" })}
          >
            Back to analytics
          </Link>
        }
      />

      <EditionSearch />

      {!selectedEditionId ? (
        <EmptyState
          title="Select a book edition"
          description="Search for a title or ISBN, then select an edition to see its library-wise distribution, stock, and sales."
        />
      ) : null}

      {selectedEditionId && errorMessage ? (
        <ErrorState
          title="This edition report failed to load"
          message={errorMessage}
          action={<RetryReportButton />}
        />
      ) : null}

      {report ? (
        <>
          <SelectedEditionSummary book={report.book} edition={report.edition} />
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
      ) : null}
    </div>
  );
}
