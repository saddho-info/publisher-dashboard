import type {
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
