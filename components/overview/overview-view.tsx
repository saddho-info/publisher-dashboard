import { Suspense } from "react";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/dashboard/page-header";
import { ActivityFeed } from "@/components/overview/activity-feed";
import { KpiRow } from "@/components/overview/kpi-row";
import { LibraryRankings } from "@/components/overview/library-rankings";
import { LowStockList } from "@/components/overview/low-stock-list";
import { PeriodSelect } from "@/components/overview/period-select";
import { TopSellersChart } from "@/components/overview/top-sellers-chart";
import { formatDateTime } from "@/lib/overview/format";
import { PERIOD_OPTIONS } from "@/lib/overview/questions";
import type { OverviewSnapshot } from "@/lib/overview/types";

export function OverviewView({
  data,
  interactive = true,
  now,
}: {
  data: OverviewSnapshot;
  interactive?: boolean;
  now?: Date;
}) {
  const periodLabel =
    PERIOD_OPTIONS.find((option) => option.value === data.period.key)?.label ??
    data.period.key;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Dashboard"
        description="Inventory, distribution, and sales at a glance — the seven publisher questions. Open a library or a book to see stock, sold, and sales."
        actions={
          <div className="flex flex-wrap items-center gap-2">
            {data.source === "live" ? (
              <Badge variant="success">Live</Badge>
            ) : (
              <Badge variant="muted">Waiting on live data</Badge>
            )}
            {interactive ? (
              <Suspense fallback={<Badge variant="outline">{periodLabel}</Badge>}>
                <PeriodSelect value={data.period.key} />
              </Suspense>
            ) : (
              <Badge variant="outline">{periodLabel}</Badge>
            )}
          </div>
        }
      />

      <KpiRow kpis={data.kpis} />

      <section className="grid gap-4 lg:grid-cols-2" aria-label="Highlights">
        <LibraryRankings libraries={data.libraries} />
        <LowStockList items={data.lowStock} />
      </section>

      <section className="grid gap-4 lg:grid-cols-2" aria-label="Trends">
        <TopSellersChart books={data.topBooks} />
        <ActivityFeed items={data.activity} now={now} />
      </section>

      <p className="text-xs text-muted-foreground">
        Updated {formatDateTime(data.generatedAt)} · {periodLabel}
      </p>
    </div>
  );
}
