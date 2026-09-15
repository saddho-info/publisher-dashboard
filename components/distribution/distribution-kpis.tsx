import { Skeleton, SkeletonTable } from "@/components/ui/skeleton";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatCount } from "@/lib/distribution/format";
import type { DistributionSummary } from "@/lib/distribution/types";

export function DistributionKpis({ summary }: { summary: DistributionSummary }) {
  return (
    <section
      aria-label="Distribution summary"
      className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4"
    >
      <Kpi label="Drafts" value={summary.draft} hint="Ready to dispatch" />
      <Kpi
        label="Dispatched"
        value={summary.dispatched}
        hint="Waiting for library receiving"
      />
      <Kpi
        label="In transit"
        value={summary.copiesInTransit}
        hint="Physical copies on dispatched shipments"
      />
      <Kpi
        label="Cancelled"
        value={summary.cancelled}
        hint="Drafts that were not sent"
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
  value: number;
  hint: string;
}) {
  return (
    <Card>
      <CardHeader>
        <CardDescription>{label}</CardDescription>
        <CardTitle className="text-2xl tabular-nums">
          {formatCount(value)}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <p className="text-xs text-muted-foreground">{hint}</p>
      </CardContent>
    </Card>
  );
}

export function DistributionSkeleton() {
  return (
    <div className="flex flex-col gap-6" aria-busy="true">
      <div className="flex flex-col gap-3 sm:flex-row sm:justify-between">
        <div className="space-y-2">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-4 w-80" />
        </div>
        <Skeleton className="h-9 w-36" />
      </div>
      <div className="grid gap-3 sm:grid-cols-4">
        <Skeleton variant="rectangular" className="h-24" />
        <Skeleton variant="rectangular" className="h-24" />
        <Skeleton variant="rectangular" className="h-24" />
        <Skeleton variant="rectangular" className="h-24" />
      </div>
      <SkeletonTable rows={6} cols={5} />
    </div>
  );
}

export function DistributionDetailSkeleton() {
  return (
    <div className="flex flex-col gap-6" aria-busy="true">
      <div className="space-y-2">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-4 w-64" />
      </div>
      <Skeleton variant="rectangular" className="h-40" />
      <SkeletonTable rows={4} cols={4} />
    </div>
  );
}
