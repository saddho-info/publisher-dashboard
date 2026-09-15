import type { CopyStatus, MovementType } from "@/lib/inventory/types";

const COPY_LABELS: Record<CopyStatus, string> = {
  IN_STOCK_PUBLISHER: "Warehouse",
  DISTRIBUTED: "In transit",
  IN_STOCK_LIBRARY: "At library",
  SOLD: "Sold",
  RETURNED: "Returned",
  LOST: "Lost",
};

const MOVEMENT_LABELS: Record<MovementType, string> = {
  PRINT_RECEIPT: "Print run",
  DISTRIBUTION: "Distributed",
  RECEIPT: "Received",
  SALE: "Sale",
  RETURN: "Return",
  ADJUSTMENT: "Adjustment",
  LOSS: "Loss",
};

export function formatCopyStatus(status: CopyStatus): string {
  return COPY_LABELS[status] ?? status;
}

export function formatMovementType(type: MovementType): string {
  return MOVEMENT_LABELS[type] ?? type;
}

export function formatCopyNumber(copyNumber: number): string {
  return `#${String(copyNumber).padStart(4, "0")}`;
}

export function formatCount(value: number): string {
  return new Intl.NumberFormat("en-US").format(value);
}
