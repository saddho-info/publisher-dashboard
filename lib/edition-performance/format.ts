import { formatBookFormat, formatMoney } from "@/lib/books/format";
import type {
  EditionPerformanceEdition,
  EditionSearchItem,
  RevenueByCurrency,
} from "@/lib/edition-performance/types";

export const NO_VALUE = "—";

export function formatRevenueEntries(entries: RevenueByCurrency[]): string[] {
  return entries.map((entry) => formatMoney(entry.totalCents, entry.currency));
}

/** "Hardcover · ISBN 9781234567890 · Author Name" */
export function editionSuggestionDetail(item: EditionSearchItem): string {
  return [
    item.title,
    formatBookFormat(item.format),
    `ISBN ${item.isbn}`,
    item.book.authors,
  ]
    .filter((part): part is string => Boolean(part))
    .join(" · ");
}

/** "Author Name · Hardcover · ISBN 9781234567890" */
export function selectedEditionDetail(
  edition: EditionPerformanceEdition,
  authors: string,
): string {
  return [
    authors,
    edition.title,
    formatBookFormat(edition.format),
    `ISBN ${edition.isbn}`,
  ]
    .filter((part): part is string => Boolean(part))
    .join(" · ");
}
