import { Skeleton, SkeletonTable } from "@/components/ui/skeleton";

export function BooksSkeleton() {
  return (
    <div className="flex flex-col gap-6" aria-busy="true">
      <div className="flex flex-col gap-3 sm:flex-row sm:justify-between">
        <div className="space-y-2">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-4 w-72" />
        </div>
        <Skeleton className="h-9 w-28" />
      </div>
      <div className="flex gap-2">
        <Skeleton className="h-9 w-64" />
        <Skeleton className="h-9 w-36" />
      </div>
      <SkeletonTable rows={6} cols={5} />
    </div>
  );
}

export function BookDetailSkeleton() {
  return (
    <div className="flex flex-col gap-6" aria-busy="true">
      <div className="space-y-2">
        <Skeleton className="h-6 w-64" />
        <Skeleton className="h-4 w-48" />
      </div>
      <Skeleton variant="rectangular" className="h-40" />
      <SkeletonTable rows={3} cols={4} />
    </div>
  );
}
