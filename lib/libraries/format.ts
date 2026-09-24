import { formatMoney } from "@/lib/books/format";
import { formatDistributionDate } from "@/lib/distribution/format";
import { formatCount } from "@/lib/inventory/format";
import type { LibraryListItem, LibraryRevenue } from "@/lib/libraries/types";

export { formatCount, formatDistributionDate, formatMoney };

export const NO_VALUE = "—";

export function formatLinkedDate(iso: string | null | undefined): string {
  if (!iso) {
    return NO_VALUE;
  }
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return iso;
  }
  return new Intl.DateTimeFormat("en-US", { dateStyle: "medium" }).format(date);
}

export function formatOptionalCount(value: number | undefined): string {
  return typeof value === "number" && Number.isFinite(value)
    ? formatCount(value)
    : NO_VALUE;
}

export function hasRevenue(
  revenue: LibraryRevenue[] | undefined | null,
): revenue is LibraryRevenue[] {
  return Array.isArray(revenue) && revenue.length > 0;
}

export function libraryInStock(library: LibraryListItem): number {
  return library.stock.onHand;
}

export function librarySold(library: LibraryListItem): number {
  return library.stock.sold;
}
