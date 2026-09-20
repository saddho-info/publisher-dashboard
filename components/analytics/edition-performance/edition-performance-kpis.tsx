import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  formatRevenueEntries,
  NO_VALUE,
} from "@/lib/edition-performance/format";
import type { EditionPerformanceSummary } from "@/lib/edition-performance/types";
import { formatCount } from "@/lib/overview/format";

const KPI_CARDS = [
  {
    key: "libraryCount" as const,
    label: "Partner libraries",
    hint: "Libraries holding or selling this edition",
  },
  {
    key: "totalDistributed" as const,
    label: "Total distributed",
    hint: "Copies allocated to partner libraries",
  },
  {
    key: "inStock" as const,
    label: "Current library stock",
    hint: "Copies on hand at libraries",
  },
  {
    key: "inTransit" as const,
    label: "In transit",
    hint: "Dispatched, not yet received",
  },
  {
    key: "sold" as const,
    label: "Copies sold",
    hint: "Confirmed unit sales",
  },
];

export function EditionPerformanceKpis({
  summary,
}: {
  summary: EditionPerformanceSummary;
}) {
  const revenue = formatRevenueEntries(summary.revenueByCurrency);

  return (
    <section aria-label="Edition performance totals">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {KPI_CARDS.map((kpi) => (
          <Card key={kpi.key}>
            <CardHeader>
              <CardDescription>{kpi.label}</CardDescription>
              <CardTitle className="text-2xl tabular-nums">
                {formatCount(summary[kpi.key])}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-xs text-muted-foreground">{kpi.hint}</p>
            </CardContent>
          </Card>
        ))}

        <Card>
          <CardHeader>
            <CardDescription>Sales revenue</CardDescription>
            <CardTitle className="text-2xl tabular-nums">
              {revenue[0] ?? NO_VALUE}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            {revenue.length > 1 ? (
              <ul className="mb-1 flex flex-col gap-0.5 text-sm font-medium text-foreground tabular-nums">
                {revenue.slice(1).map((amount) => (
                  <li key={amount}>{amount}</li>
                ))}
              </ul>
            ) : null}
            <p className="text-xs text-muted-foreground">
              {revenue.length > 1
                ? "Reported separately per currency"
                : "Across partner libraries"}
            </p>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
