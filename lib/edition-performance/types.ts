import type { Edition, EditionDetail, PaginationMeta } from "@/lib/books/types";

/**
 * `GET /api/v1/editions` returns a narrower edition than {@link EditionDetail}:
 * catalog-only fields such as `publicationDate` and timestamps are omitted.
 */
export type EditionSearchItem = Pick<
  Edition,
  | "id"
  | "bookId"
  | "title"
  | "format"
  | "isbn"
  | "isbn10"
  | "listPriceCents"
  | "currency"
  | "coverImageUrl"
  | "isActive"
> & {
  book: EditionDetail["book"];
};

export type EditionSearchResult = {
  data: EditionSearchItem[];
  meta: PaginationMeta;
};

export type RevenueByCurrency = {
  currency: string;
  totalCents: number;
};

export type EditionPerformanceBook = {
  id: string;
  title: string;
  authors: string;
  publisherId: string;
};

export type EditionPerformanceEdition = Pick<
  Edition,
  | "id"
  | "bookId"
  | "title"
  | "format"
  | "isbn"
  | "isbn10"
  | "listPriceCents"
  | "currency"
>;

export type EditionPerformanceSummary = {
  libraryCount: number;
  totalDistributed: number;
  inStock: number;
  inTransit: number;
  sold: number;
  revenueByCurrency: RevenueByCurrency[];
};

export type EditionPerformanceLibrary = {
  id: string;
  name: string;
  slug: string;
};

export type LibraryPerformanceRow = {
  library: EditionPerformanceLibrary;
  totalDistributed: number;
  inStock: number;
  inTransit: number;
  sold: number;
  revenueByCurrency: RevenueByCurrency[];
};

export type EditionPerformanceReport = {
  book: EditionPerformanceBook;
  edition: EditionPerformanceEdition;
  summary: EditionPerformanceSummary;
  libraries: LibraryPerformanceRow[];
};
