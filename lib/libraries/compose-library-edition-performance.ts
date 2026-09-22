import { redirect } from "next/navigation";
import { apiServerFetch, ApiError, readApiError } from "@/lib/api/server";
import type {
  LibraryEditionPerformance,
  LibraryEditionPerformanceRow,
  LibraryRevenue,
} from "@/lib/libraries/types";

const PAGE_SIZE = 100;
const MAX_PAGES = 10;
const REPORTABLE_DISTRIBUTION_STATUSES = new Set([
  "DISPATCHED",
  "PARTIALLY_RECEIVED",
  "RECEIVED",
]);

type Totals = {
  book: LibraryEditionPerformanceRow["book"];
  edition: LibraryEditionPerformanceRow["edition"];
  totalDistributed: number;
  inStock: number;
  inTransit: number;
  sold: number;
  revenueByCurrency: Map<string, number>;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.length > 0;
}

function asNumber(value: unknown): number {
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

function paginatedMeta(value: unknown): { totalPages: number } | null {
  if (!isRecord(value) || !isRecord(value.meta) || !Array.isArray(value.data)) {
    return null;
  }
  const totalPages = value.meta.totalPages;
  return {
    totalPages:
      typeof totalPages === "number" && Number.isFinite(totalPages)
        ? totalPages
        : 1,
  };
}

async function fetchPaginated(
  path: string,
  query: Record<string, string>,
): Promise<unknown[]> {
  const rows: unknown[] = [];
  for (let page = 1; page <= MAX_PAGES; page++) {
    const params = new URLSearchParams({
      ...query,
      page: String(page),
      limit: String(PAGE_SIZE),
    });
    const response = await apiServerFetch(`${path}?${params.toString()}`);
    if (response.status === 401) {
      redirect("/login");
    }
    if (!response.ok) {
      throw new ApiError(await readApiError(response), response.status);
    }
    const body: unknown = await response.json().catch(() => null);
    const meta = paginatedMeta(body);
    if (!meta || !isRecord(body)) {
      throw new ApiError(
        "Library edition performance fallback was malformed.",
        502,
      );
    }
    rows.push(...body.data);
    if (page >= meta.totalPages) {
      break;
    }
  }
  return rows;
}

async function fetchLibrary(libraryId: string): Promise<{
  id: string;
  name: string;
  slug: string;
}> {
  const response = await apiServerFetch(
    `/api/v1/libraries/${encodeURIComponent(libraryId)}`,
  );
  if (response.status === 401) {
    redirect("/login");
  }
  if (response.status === 404 || response.status === 403) {
    throw new ApiError("Library edition performance was not found.", 404);
  }
  if (!response.ok) {
    throw new ApiError(await readApiError(response), response.status);
  }
  const body: unknown = await response.json().catch(() => null);
  if (
    !isRecord(body) ||
    !isNonEmptyString(body.id) ||
    !isNonEmptyString(body.name) ||
    !isNonEmptyString(body.slug)
  ) {
    throw new ApiError("Library response was malformed.", 502);
  }
  return { id: body.id, name: body.name, slug: body.slug };
}

function prefer(current: string, next: unknown): string {
  return isNonEmptyString(next) ? next : current;
}

function preferNullable(current: string | null, next: unknown): string | null {
  if (next === null) {
    return current;
  }
  return isNonEmptyString(next) ? next : current;
}

function totalsFor(
  rows: Map<string, Totals>,
  editionId: string,
  book: Record<string, unknown> | null,
  edition: Record<string, unknown> | null,
): Totals {
  let totals = rows.get(editionId);
  if (!totals) {
    totals = {
      book: {
        id: prefer("", book?.id),
        title: prefer("", book?.title),
        authors: prefer("", book?.authors),
        publisherId: prefer("", book?.publisherId),
      },
      edition: {
        id: editionId,
        bookId: prefer(prefer("", edition?.bookId), book?.id),
        title: preferNullable(null, edition?.title),
        format: prefer("", edition?.format),
        isbn: prefer("", edition?.isbn),
        isbn10: preferNullable(null, edition?.isbn10),
        listPriceCents: asNumber(edition?.listPriceCents),
        currency: prefer("", edition?.currency),
      },
      totalDistributed: 0,
      inStock: 0,
      inTransit: 0,
      sold: 0,
      revenueByCurrency: new Map<string, number>(),
    };
    rows.set(editionId, totals);
    return totals;
  }

  totals.book.id = prefer(totals.book.id, book?.id);
  totals.book.title = prefer(totals.book.title, book?.title);
  totals.book.authors = prefer(totals.book.authors, book?.authors);
  totals.book.publisherId = prefer(totals.book.publisherId, book?.publisherId);
  totals.edition.bookId = prefer(
    prefer(totals.edition.bookId, edition?.bookId),
    book?.id,
  );
  totals.edition.title = preferNullable(totals.edition.title, edition?.title);
  totals.edition.format = prefer(totals.edition.format, edition?.format);
  totals.edition.isbn = prefer(totals.edition.isbn, edition?.isbn);
  totals.edition.isbn10 = preferNullable(totals.edition.isbn10, edition?.isbn10);
  if (totals.edition.listPriceCents === 0) {
    totals.edition.listPriceCents = asNumber(edition?.listPriceCents);
  }
  totals.edition.currency = prefer(totals.edition.currency, edition?.currency);
  return totals;
}

function currencyTotals(revenueByCurrency: Map<string, number>): LibraryRevenue[] {
  return [...revenueByCurrency.entries()]
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([currency, totalCents]) => ({ currency, totalCents }));
}

function toRows(totalsByEdition: Map<string, Totals>): LibraryEditionPerformanceRow[] {
  return [...totalsByEdition.values()]
    .filter(
      (row) =>
        row.book.id.length > 0 &&
        row.book.title.length > 0 &&
        row.edition.format.length > 0 &&
        row.edition.isbn.length > 0,
    )
    .map((row) => ({
      book: row.book,
      edition: row.edition,
      totalDistributed: row.totalDistributed,
      inStock: row.inStock,
      inTransit: row.inTransit,
      sold: row.sold,
      revenueByCurrency: currencyTotals(row.revenueByCurrency),
    }))
    .sort(
      (left, right) =>
        right.inStock - left.inStock ||
        right.sold - left.sold ||
        left.book.title.localeCompare(right.book.title),
    );
}

/**
 * Builds the library books ledger from list APIs that are already deployed.
 * Used when GET /libraries/:id/edition-performance is missing (404).
 */
export async function composeLibraryEditionPerformance(
  libraryId: string,
): Promise<LibraryEditionPerformance> {
  const [library, copies, sales, distributions] = await Promise.all([
    fetchLibrary(libraryId),
    fetchPaginated("/api/v1/copies", { libraryId }),
    fetchPaginated("/api/v1/sales", { libraryId }),
    fetchPaginated("/api/v1/distributions", { libraryId }),
  ]);

  if (library.id !== libraryId) {
    throw new ApiError(
      "Library edition performance response did not match the selected library.",
      502,
    );
  }

  const totalsByEdition = new Map<string, Totals>();

  for (const item of copies) {
    const copy = isRecord(item) ? item : null;
    const edition = copy && isRecord(copy.edition) ? copy.edition : null;
    const book = edition && isRecord(edition.book) ? edition.book : null;
    if (!copy || !edition || !isNonEmptyString(edition.id)) {
      continue;
    }
    const totals = totalsFor(totalsByEdition, edition.id, book, edition);
    if (copy.status === "IN_STOCK_LIBRARY") {
      totals.inStock += 1;
    } else if (copy.status === "DISTRIBUTED") {
      totals.inTransit += 1;
    }
  }

  for (const item of distributions) {
    const shipment = isRecord(item) ? item : null;
    if (
      !shipment ||
      !isNonEmptyString(shipment.status) ||
      !REPORTABLE_DISTRIBUTION_STATUSES.has(shipment.status) ||
      !Array.isArray(shipment.items)
    ) {
      continue;
    }
    for (const line of shipment.items) {
      const row = isRecord(line) ? line : null;
      const edition = row && isRecord(row.edition) ? row.edition : null;
      const book = edition && isRecord(edition.book) ? edition.book : null;
      const editionId =
        (edition && isNonEmptyString(edition.id) && edition.id) ||
        (row && isNonEmptyString(row.editionId) ? row.editionId : "");
      if (!editionId) {
        continue;
      }
      totalsFor(totalsByEdition, editionId, book, edition).totalDistributed +=
        asNumber(row?.quantity);
    }
  }

  for (const item of sales) {
    const sale = isRecord(item) ? item : null;
    if (!sale || !Array.isArray(sale.items)) {
      continue;
    }
    const currency = isNonEmptyString(sale.currency) ? sale.currency : null;
    for (const line of sale.items) {
      const row = isRecord(line) ? line : null;
      const edition = row && isRecord(row.edition) ? row.edition : null;
      const book = edition && isRecord(edition.book) ? edition.book : null;
      if (!edition || !isNonEmptyString(edition.id)) {
        continue;
      }
      const quantity = asNumber(row?.quantity) || 1;
      const totals = totalsFor(totalsByEdition, edition.id, book, edition);
      totals.sold += quantity;
      if (currency) {
        totals.revenueByCurrency.set(
          currency,
          (totals.revenueByCurrency.get(currency) ?? 0) +
            asNumber(row?.unitPriceCents) * quantity,
        );
      }
    }
  }

  const editions = toRows(totalsByEdition);
  const summaryRevenue = new Map<string, number>();
  const summary = editions.reduce(
    (totals, row) => {
      totals.totalDistributed += row.totalDistributed;
      totals.inStock += row.inStock;
      totals.inTransit += row.inTransit;
      totals.sold += row.sold;
      for (const revenue of row.revenueByCurrency) {
        summaryRevenue.set(
          revenue.currency,
          (summaryRevenue.get(revenue.currency) ?? 0) + revenue.totalCents,
        );
      }
      return totals;
    },
    { totalDistributed: 0, inStock: 0, inTransit: 0, sold: 0 },
  );

  return {
    library,
    summary: {
      ...summary,
      revenueByCurrency: currencyTotals(summaryRevenue),
    },
    editions,
  };
}
