import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatCount } from "@/lib/overview/format";
import type { OverviewKpis } from "@/lib/overview/types";

const KPI_CARDS = [
  {
    key: "totalInventory" as const,
    label: "Total inventory",
    question: "How much inventory exists?",
    hint: "Copies on hand across warehouse and libraries",
  },
  {
    key: "distributed" as const,
    label: "Distributed",
    question: "How much has been distributed?",
    hint: "Copies currently at partner libraries",
  },
  {
    key: "sold" as const,
    label: "Sold",
    question: "How much has been sold?",
    hint: "Confirmed sales in the selected period",
  },
] as const;

export function KpiRow({ kpis }: { kpis: OverviewKpis }) {
  return (
    <section aria-label="Key metrics">
      <div className="grid gap-3 sm:grid-cols-3">
        {KPI_CARDS.map((kpi) => (
          <Card key={kpi.key}>
            <CardHeader>
              <CardDescription>{kpi.label}</CardDescription>
              <CardTitle className="text-2xl tabular-nums">
                {formatCount(kpis[kpi.key])}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="sr-only">{kpi.question}</p>
              <p className="text-xs text-muted-foreground">{kpi.hint}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
