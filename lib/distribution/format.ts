import type { DistributionStatus } from "@/lib/distribution/types";

export { formatCount } from "@/lib/inventory/format";

export function formatDistributionDate(iso: string | null | undefined): string {
  if (!iso) {
    return "—";
  }
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return iso;
  }
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

export function formatDistributionStatus(
  status: DistributionStatus,
): string {
  if (status === "DRAFT") return "Draft";
  if (status === "DISPATCHED") return "Dispatched";
  if (status === "PARTIALLY_RECEIVED") return "Partially received";
  if (status === "RECEIVED") return "Received";
  return "Cancelled";
}
