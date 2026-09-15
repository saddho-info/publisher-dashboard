import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { StatusPill } from "@/components/ui/status-pill";
import { InventoryIcon } from "@/components/dashboard/icons";
import { formatCount } from "@/lib/overview/format";
import type { OverviewLowStockItem } from "@/lib/overview/types";

export function LowStockList({ items }: { items: OverviewLowStockItem[] }) {
  return (
    <Card className="overflow-hidden">
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <div className="flex flex-col gap-1">
            <CardTitle>Low-stock books</CardTitle>
            <CardDescription>
              Which books are low stock? Editions at or below their reorder
              threshold.
            </CardDescription>
          </div>
          {items.length > 0 ? (
            <Badge variant="warning">{items.length}</Badge>
          ) : null}
        </div>
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <EmptyState
            className="border-0 bg-muted/40 py-10 shadow-none"
            title="No stock alerts"
            description="Warehouse editions are above their reorder thresholds."
            icon={<InventoryIcon className="size-6 text-muted-foreground" />}
            action={
              <Link
                href="/inventory"
                className="text-xs font-medium text-primary hover:underline"
              >
                Open inventory
              </Link>
            }
          />
        ) : (
          <ul className="divide-y divide-border">
            {items.map((item) => (
              <li
                key={item.editionId}
                className="flex items-start justify-between gap-3 py-3 first:pt-0 last:pb-0"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{item.bookTitle}</p>
                  <p className="text-xs text-muted-foreground">
                    {item.editionLabel}
                  </p>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-1">
                  <StatusPill status="LOW_STOCK" />
                  <p className="text-xs tabular-nums text-muted-foreground">
                    {formatCount(item.onHand)} / {formatCount(item.threshold)}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
      {items.length > 0 ? (
        <CardFooter>
          <Link
            href="/alerts"
            className="text-xs font-medium text-primary hover:underline"
          >
            View all alerts
          </Link>
        </CardFooter>
      ) : null}
    </Card>
  );
}
