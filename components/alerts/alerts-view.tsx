import Link from "next/link";
import { AlertsIcon, InventoryIcon } from "@/components/dashboard/icons";
import { PageHeader } from "@/components/dashboard/page-header";
import { Badge } from "@/components/ui/badge";
import { buttonClassName } from "@/components/ui/button-styles";
import { EmptyState } from "@/components/ui/empty-state";
import { StatusPill } from "@/components/ui/status-pill";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatCount } from "@/lib/overview/format";
import type { OverviewLowStockItem, OverviewSnapshot } from "@/lib/overview/types";

export function AlertsView({
  lowStock,
  lowStockCount,
}: {
  lowStock: OverviewLowStockItem[];
  lowStockCount: number;
}) {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Alerts"
        description="Low-stock and operational exceptions that need attention."
        actions={
          <div className="flex flex-wrap items-center gap-2">
            {lowStockCount > 0 ? (
              <Badge variant="warning">{lowStockCount} low stock</Badge>
            ) : (
              <Badge variant="success">All clear</Badge>
            )}
            <Link
              href="/inventory?stock=low"
              className={buttonClassName({ variant: "outline", size: "sm" })}
            >
              Inventory filter
            </Link>
          </div>
        }
      />

      {lowStock.length === 0 ? (
        <EmptyState
          title="No stock alerts"
          description="Warehouse editions are above their reorder thresholds."
          icon={<AlertsIcon className="size-6 text-muted-foreground" />}
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
        <section aria-label="Low-stock editions" className="flex flex-col gap-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <InventoryIcon className="size-4" />
            <p>
              Editions at or below their warehouse reorder threshold. Adjust
              thresholds from inventory detail.
            </p>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Edition</TableHead>
                <TableHead className="text-right">On hand</TableHead>
                <TableHead className="text-right">Threshold</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {lowStock.map((item) => (
                <TableRow key={item.editionId}>
                  <TableCell>
                    <Link
                      href={`/inventory/${item.editionId}`}
                      className="font-medium text-foreground hover:text-primary hover:underline"
                    >
                      {item.bookTitle}
                    </Link>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {item.editionLabel}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {formatCount(item.onHand)}
                  </TableCell>
                  <TableCell className="text-right tabular-nums text-muted-foreground">
                    {formatCount(item.threshold)}
                  </TableCell>
                  <TableCell>
                    <StatusPill status="LOW_STOCK" />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </section>
      )}
    </div>
  );
}

export function alertsFromOverview(data: OverviewSnapshot) {
  return {
    lowStock: data.lowStock,
    lowStockCount: data.kpis.lowStockCount,
  };
}
