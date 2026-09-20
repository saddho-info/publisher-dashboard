import type {
  EditionPerformanceReport,
  EditionSearchItem,
  EditionSearchResult,
  LibraryPerformanceRow,
  RevenueByCurrency,
} from "@/lib/edition-performance/types";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.length > 0;
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function isNullableString(value: unknown): value is string | null {
  return value === null || typeof value === "string";
}

function isRevenueByCurrency(value: unknown): value is RevenueByCurrency {
  return (
    isRecord(value) &&
    isNonEmptyString(value.currency) &&
    isFiniteNumber(value.totalCents)
  );
}

function isRevenueList(value: unknown): value is RevenueByCurrency[] {
  return Array.isArray(value) && value.every(isRevenueByCurrency);
}

/**
 * Unknown format codes are tolerated: the humanizer falls back to the raw value
 * so a new backend enum member does not blank out an otherwise valid row.
 */
export function isEditionSearchItem(value: unknown): value is EditionSearchItem {
  if (!isRecord(value)) {
    return false;
  }
  const book = value.book;
  return (
    isNonEmptyString(value.id) &&
    isNonEmptyString(value.bookId) &&
    isNullableString(value.title) &&
    isNonEmptyString(value.format) &&
    isNonEmptyString(value.isbn) &&
    isNullableString(value.isbn10) &&
    isFiniteNumber(value.listPriceCents) &&
    isNonEmptyString(value.currency) &&
    typeof value.isActive === "boolean" &&
    isRecord(book) &&
    isNonEmptyString(book.id) &&
    isNonEmptyString(book.title) &&
    typeof book.authors === "string"
  );
}

export function isEditionSearchResult(
  value: unknown,
): value is EditionSearchResult {
  return (
    isRecord(value) &&
    Array.isArray(value.data) &&
    value.data.every(isEditionSearchItem) &&
    isRecord(value.meta)
  );
}

function isLibraryPerformanceRow(
  value: unknown,
): value is LibraryPerformanceRow {
  if (!isRecord(value)) {
    return false;
  }
  const library = value.library;
  return (
    isRecord(library) &&
    isNonEmptyString(library.id) &&
    isNonEmptyString(library.name) &&
    isFiniteNumber(value.totalDistributed) &&
    isFiniteNumber(value.inStock) &&
    isFiniteNumber(value.inTransit) &&
    isFiniteNumber(value.sold) &&
    isRevenueList(value.revenueByCurrency)
  );
}

export function isEditionPerformanceReport(
  value: unknown,
): value is EditionPerformanceReport {
  if (!isRecord(value)) {
    return false;
  }

  const { book, edition, summary, libraries } = value;

  const hasBook =
    isRecord(book) && isNonEmptyString(book.id) && isNonEmptyString(book.title);

  const hasEdition =
    isRecord(edition) &&
    isNonEmptyString(edition.id) &&
    isNonEmptyString(edition.format) &&
    isNonEmptyString(edition.isbn) &&
    isFiniteNumber(edition.listPriceCents) &&
    isNonEmptyString(edition.currency);

  const hasSummary =
    isRecord(summary) &&
    isFiniteNumber(summary.libraryCount) &&
    isFiniteNumber(summary.totalDistributed) &&
    isFiniteNumber(summary.inStock) &&
    isFiniteNumber(summary.inTransit) &&
    isFiniteNumber(summary.sold) &&
    isRevenueList(summary.revenueByCurrency);

  return (
    hasBook &&
    hasEdition &&
    hasSummary &&
    Array.isArray(libraries) &&
    libraries.every(isLibraryPerformanceRow)
  );
}
