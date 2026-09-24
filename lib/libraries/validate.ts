import type {
  LibraryEditionPerformance,
  LibraryEditionPerformanceRow,
  LibraryPublisherPerformance,
  LibraryRevenue,
} from "@/lib/libraries/types";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.length > 0;
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function isRevenue(value: unknown): value is LibraryRevenue {
  return (
    isRecord(value) &&
    isNonEmptyString(value.currency) &&
    isFiniteNumber(value.totalCents)
  );
}

export function isLibraryPublisherPerformance(
  value: unknown,
): value is LibraryPublisherPerformance {
  if (!isRecord(value)) {
    return false;
  }

  const { library, summary } = value;
  return (
    isRecord(library) &&
    isNonEmptyString(library.id) &&
    isNonEmptyString(library.name) &&
    isNonEmptyString(library.slug) &&
    isRecord(summary) &&
    isFiniteNumber(summary.totalDistributed) &&
    isFiniteNumber(summary.inStock) &&
    isFiniteNumber(summary.inTransit) &&
    isFiniteNumber(summary.sold) &&
    Array.isArray(summary.revenueByCurrency) &&
    summary.revenueByCurrency.every(isRevenue)
  );
}

function isNullableString(value: unknown): value is string | null {
  return value === null || typeof value === "string";
}

function isEditionRow(value: unknown): value is LibraryEditionPerformanceRow {
  if (!isRecord(value)) {
    return false;
  }
  const { book, edition } = value;
  return (
    isRecord(book) &&
    isNonEmptyString(book.id) &&
    isNonEmptyString(book.title) &&
    isRecord(edition) &&
    isNonEmptyString(edition.id) &&
    isNonEmptyString(edition.bookId) &&
    isNullableString(edition.title) &&
    isNonEmptyString(edition.format) &&
    isNonEmptyString(edition.isbn) &&
    isFiniteNumber(value.totalDistributed) &&
    isFiniteNumber(value.inStock) &&
    isFiniteNumber(value.inTransit) &&
    isFiniteNumber(value.sold) &&
    Array.isArray(value.revenueByCurrency) &&
    value.revenueByCurrency.every(isRevenue)
  );
}

export function isLibraryEditionPerformance(
  value: unknown,
): value is LibraryEditionPerformance {
  if (!isRecord(value)) {
    return false;
  }

  const { library, summary, editions } = value;
  return (
    isRecord(library) &&
    isNonEmptyString(library.id) &&
    isNonEmptyString(library.name) &&
    isNonEmptyString(library.slug) &&
    isRecord(summary) &&
    isFiniteNumber(summary.totalDistributed) &&
    isFiniteNumber(summary.inStock) &&
    isFiniteNumber(summary.inTransit) &&
    isFiniteNumber(summary.sold) &&
    Array.isArray(summary.revenueByCurrency) &&
    summary.revenueByCurrency.every(isRevenue) &&
    Array.isArray(editions) &&
    editions.every(isEditionRow)
  );
}
