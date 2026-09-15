import { Skeleton, SkeletonTable } from "@/components/ui/skeleton";

export function LibrariesSkeleton() {
  return (
    <div className="flex flex-col gap-6" aria-busy="true">
      <div className="flex flex-col gap-3 sm:flex-row sm:justify-between">
        <div className="space-y-2">
          <Skeleton className="h-6 w-36" />
          <Skeleton className="h-4 w-80" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-9 w-28" />
          <Skeleton className="h-9 w-32" />
        </div>
      </div>
      <div className="flex gap-2">
        <Skeleton className="h-9 w-64" />
        <Skeleton className="h-9 w-36" />
      </div>
      <SkeletonTable rows={6} cols={6} />
    </div>
  );
}

export function LibraryDetailSkeleton() {
  return (
    <div className="flex flex-col gap-6" aria-busy="true">
      <div className="space-y-2">
        <Skeleton className="h-6 w-64" />
        <Skeleton className="h-4 w-48" />
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        <Skeleton variant="rectangular" className="h-24" />
        <Skeleton variant="rectangular" className="h-24" />
        <Skeleton variant="rectangular" className="h-24" />
      </div>
      <Skeleton variant="rectangular" className="h-40" />
    </div>
  );
}
