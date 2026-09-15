import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { StatusPill, type StatusValue } from "@/components/ui/status-pill";
import { formatDateTime, formatRelativeTime } from "@/lib/overview/format";
import type {
  OverviewActivityItem,
  OverviewActivityType,
} from "@/lib/overview/types";

const ACTIVITY_STATUS: Record<OverviewActivityType, StatusValue> = {
  SALE: "SOLD",
  DISTRIBUTION: "DISTRIBUTED",
  RECEIPT: "RECEIVED",
  ADJUSTMENT: "CONFIRMED",
  RETURN: "RETURNED",
};

export function ActivityFeed({
  items,
  now,
}: {
  items: OverviewActivityItem[];
  now?: Date;
}) {
  return (
    <Card className="overflow-hidden">
      <CardHeader>
        <CardTitle>Recent activity</CardTitle>
        <CardDescription>
          What happened recently? Latest sales, distributions, and inventory
          movements.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <EmptyState
            className="border-0 bg-muted/40 py-10 shadow-none"
            title="No events yet"
            description="The feed will show recent inventory movements and sales."
            action={
              <Link
                href="/sales"
                className="text-xs font-medium text-primary hover:underline"
              >
                View sales
              </Link>
            }
          />
        ) : (
          <ol className="divide-y divide-border">
            {items.map((item) => (
              <li key={item.id} className="flex gap-3 py-3 first:pt-0 last:pb-0">
                <StatusPill
                  status={ACTIVITY_STATUS[item.type]}
                  className="mt-0.5"
                />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium">{item.title}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {item.detail}
                  </p>
                </div>
                <time
                  dateTime={item.occurredAt}
                  title={formatDateTime(item.occurredAt)}
                  className="shrink-0 text-xs text-muted-foreground"
                >
                  {formatRelativeTime(item.occurredAt, now)}
                </time>
              </li>
            ))}
          </ol>
        )}
      </CardContent>
      {items.length > 0 ? (
        <CardFooter>
          <Link
            href="/sales"
            className="text-xs font-medium text-primary hover:underline"
          >
            View sales
          </Link>
        </CardFooter>
      ) : null}
    </Card>
  );
}
