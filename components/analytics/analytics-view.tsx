import Link from "next/link";
import { Suspense } from "react";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/dashboard/page-header";
import { ActivityFeed } from "@/components/overview/activity-feed";
import { KpiRow } from "@/components/overview/kpi-row";
import { LibraryRankings } from "@/components/overview/library-rankings";
import { LowStockList } from "@/components/overview/low-stock-list";
import { PeriodSelect } from "@/components/overview/period-select";
import { TopSellersChart } from "@/components/overview/top-sellers-chart";
import { buttonClassName } from "@/components/ui/button-styles";
import { formatDateTime } from "@/lib/overview/format";
import { PERIOD_OPTIONS } from "@/lib/overview/questions";
import type { OverviewSnapshot } from "@/lib/overview/types";

export function AnalyticsView({ data }: { data: OverviewSnapshot }) {
  const periodLabel =
    PERIOD_OPTIONS.find((option) => option.value === data.period.key)?.label ??
    data.period.key;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Analytics"
        description="Top books, library performance, and inventory trends for this publisher."
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="success">Live</Badge>
            <Suspense fallback={<Badge variant="outline">{periodLabel}</Badge>}>
              <PeriodSelect value={data.period.key} />
            </Suspense>
            <Link
              href="/alerts"
              className={buttonClassName({ variant: "outline", size: "sm" })}
            >
              Open alerts
            </Link>
          </div>
        }
      />

      <KpiRow kpis={data.kpis} />

      <section className="grid gap-4 lg:grid-cols-2" aria-label="Performance">
        <TopSellersChart books={data.topBooks} showAnalyticsLink={false} />
        <LibraryRankings libraries={data.libraries} />
      </section>

      <section className="grid gap-4 lg:grid-cols-2" aria-label="Operations">
        <LowStockList items={data.lowStock} />
        <ActivityFeed items={data.activity} />      </section>

      <p className="text-xs text-muted-foreground">
        Updated {formatDateTime(data.generatedAt)} · {periodLabel}
      </p>
    </div>
  );
}
