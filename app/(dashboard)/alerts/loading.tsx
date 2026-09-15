import { Skeleton } from "@/components/ui/skeleton";

export default function AlertsLoading() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-4 w-80 max-w-full" />
      </div>
      <Skeleton className="h-64 w-full rounded-lg" />
    </div>
  );
}
