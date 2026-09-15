import { Skeleton } from "@/components/ui/skeleton";

export function OverviewSkeleton() {
  return (
    <div
      className="flex flex-col gap-6"
      aria-busy="true"
      aria-label="Loading dashboard"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2">
          <Skeleton className="h-7 w-40" />
          <Skeleton className="h-4 w-80 max-w-full" />
        </div>
        <Skeleton className="h-8 w-40" />
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        {Array.from({ length: 3 }, (_, index) => (
          <div
            key={index}
            className="rounded-lg border border-border bg-card px-5 py-4"
          >
            <Skeleton className="h-3 w-24" />
            <Skeleton className="mt-3 h-7 w-16" />
            <Skeleton className="mt-3 h-3 w-40" />
          </div>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Skeleton variant="rectangular" className="h-64" />
        <Skeleton variant="rectangular" className="h-64" />
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <Skeleton variant="rectangular" className="h-64" />
        <Skeleton variant="rectangular" className="h-64" />
      </div>
    </div>
  );
}
