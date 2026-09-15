import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton, SkeletonTable } from "@/components/ui/skeleton";
import { formatCount, formatMoney } from "@/lib/sales/format";
import type { SaleSummary } from "@/lib/sales/types";

export function SalesKpis({ summary }: { summary: SaleSummary }) {
  return (
    <section
      aria-label="Sales summary"
      className="grid gap-3 sm:grid-cols-3"
    >
      <Kpi label="Sales" value={formatCount(summary.saleCount)} hint="Completed transactions" />
      <Kpi
        label="Copies sold"
        value={formatCount(summary.itemCount)}
        hint="Physical units across partner libraries"
      />
      <Kpi
        label="Revenue"
        value={formatMoney(summary.totalCents)}
        hint="Sum of recorded sale totals"
      />
    </section>
  );
}

function Kpi({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint: string;
}) {
  return (
    <Card>
      <CardHeader>
        <CardDescription>{label}</CardDescription>
        <CardTitle className="text-2xl tabular-nums">{value}</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <p className="text-xs text-muted-foreground">{hint}</p>
      </CardContent>
    </Card>
  );
}

export function SalesSkeleton() {
  return (
    <div className="flex flex-col gap-6" aria-busy="true">
      <div className="space-y-2">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-4 w-80" />
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        <Skeleton variant="rectangular" className="h-24" />
        <Skeleton variant="rectangular" className="h-24" />
        <Skeleton variant="rectangular" className="h-24" />
      </div>
      <SkeletonTable rows={6} cols={5} />
    </div>
  );
}

export function SaleDetailSkeleton() {
  return (
    <div className="flex flex-col gap-6" aria-busy="true">
      <div className="space-y-2">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-4 w-64" />
      </div>
      <Skeleton variant="rectangular" className="h-40" />
      <SkeletonTable rows={3} cols={4} />
    </div>
  );
}
