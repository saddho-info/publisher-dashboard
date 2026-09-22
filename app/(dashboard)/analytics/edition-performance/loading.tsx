import { Skeleton, SkeletonTable } from "@/components/ui/skeleton";

export default function EditionPerformanceLoading() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <Skeleton className="h-6 w-56" />
        <Skeleton className="h-4 w-full max-w-lg" />
      </div>

      <div className="flex max-w-2xl flex-col gap-1.5">
        <Skeleton className="h-3.5 w-36" />
        <Skeleton className="h-9 w-full rounded-md" />
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }, (_, index) => (
          <Skeleton key={index} className="h-28 w-full rounded-lg" />
        ))}
      </div>

      <SkeletonTable rows={4} cols={6} />
    </div>
  );
}
