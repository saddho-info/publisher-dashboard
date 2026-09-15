import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatCount } from "@/lib/inventory/format";
import type { InventorySummary } from "@/lib/inventory/types";

const KPI_CARDS = [
  {
    key: "warehouseOnHand" as const,
    label: "Warehouse",
    hint: "Copies in publisher stock",
  },
  {
    key: "libraryOnHand" as const,
    label: "At libraries",
    hint: "Copies received by partner libraries",
  },
  {
    key: "inTransit" as const,
    label: "In transit",
    hint: "Distributed, not yet received",
  },
  {
    key: "sold" as const,
    label: "Sold",
    hint: "Confirmed unit sales",
  },
] as const;

export function InventoryKpis({ summary }: { summary: InventorySummary }) {
  return (
    <section aria-label="Inventory totals">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
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
      </div>
    </section>
  );
}
