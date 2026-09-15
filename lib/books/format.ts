import type { BookFormat } from "@/lib/books/types";

const FORMAT_LABELS: Record<BookFormat, string> = {
  HARDCOVER: "Hardcover",
  PAPERBACK: "Paperback",
  MASS_MARKET: "Mass market",
  BOARD_BOOK: "Board book",
  OTHER: "Other",
};

export const FORMAT_OPTIONS = (
  Object.entries(FORMAT_LABELS) as Array<[BookFormat, string]>
).map(([value, label]) => ({ value, label }));

export function formatBookFormat(format: BookFormat): string {
  return FORMAT_LABELS[format] ?? format;
}

export function formatIsbn13(digits: string): string {
  const compact = digits.replace(/[^0-9]/g, "");
  if (compact.length !== 13) {
    return digits;
  }
  return `${compact.slice(0, 3)}-${compact.slice(3, 12)}-${compact.slice(12)}`;
}

export function formatMoney(cents: number, currency = "USD"): string {
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
    }).format(cents / 100);
  } catch {
    return `${(cents / 100).toFixed(2)} ${currency}`;
  }
}

export function dollarsFromCents(cents: number): string {
  return (cents / 100).toFixed(2);
}

export function parseMoneyToCents(input: string): number | null {
  const trimmed = input.trim().replace(/[$,]/g, "");
  if (!/^\d+(\.\d{1,2})?$/.test(trimmed)) {
    return null;
  }
  const [dollars, fraction = ""] = trimmed.split(".");
  return Number(dollars) * 100 + Number(fraction.padEnd(2, "0"));
}

export function formatPublicationDate(iso: string | null): string {
  if (!iso) {
    return "—";
  }
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return iso;
  }
  return new Intl.DateTimeFormat("en-US", { dateStyle: "medium" }).format(date);
}

export function toDateInputValue(iso: string | null): string {
  if (!iso) {
    return "";
  }
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return "";
  }
  return date.toISOString().slice(0, 10);
}
