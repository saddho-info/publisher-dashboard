import type { Edition, PaginationMeta, Paginated } from "@/lib/books/types";

export type { PaginationMeta, Paginated };

export type LibraryStock = {
  onHand: number;
  inTransit: number;
  sold: number;
  returned: number;
  lost: number;
  copyCount: number;
};

export type LibraryLink = {
  id: string;
  publisherId: string;
  isActive: boolean;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
};

export type LibraryRevenue = {
  currency: string;
  totalCents: number;
};

export type LibraryListItem = {
  id: string;
  name: string;
  slug: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  _count: { users: number };
  link: LibraryLink | null;
  stock: LibraryStock;
  /**
   * Publisher-scoped list ledger from GET /api/v1/libraries.
   * Absent when the list payload has not been enriched (do not N+1
   * /publisher-performance). Missing last sent / distributed / revenue
   * render as "—"; in stock and sold always come from `stock`.
   */
  lastDispatchedAt?: string | null;
  lastDistributionId?: string | null;
  totalDistributed?: number;
  revenueByCurrency?: LibraryRevenue[];
};

export type LibraryDetail = LibraryListItem;

export type LibraryPublisherPerformance = {
  library: Pick<LibraryListItem, "id" | "name" | "slug">;
  summary: {
    totalDistributed: number;
    inStock: number;
    inTransit: number;
    sold: number;
    revenueByCurrency: LibraryRevenue[];
  };
};

/**
 * GET /api/v1/libraries/:id/edition-performance
 * Mirror of EditionPerformanceReport.libraries, inverted: editions[] on the library.
 */
export type LibraryEditionPerformanceEdition = Pick<
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

export type LibraryEditionPerformanceRow = {
  book: {
    id: string;
    title: string;
    authors: string;
    publisherId: string;
  };
  edition: LibraryEditionPerformanceEdition;
  totalDistributed: number;
  inStock: number;
  inTransit: number;
  sold: number;
  revenueByCurrency: LibraryRevenue[];
};

export type LibraryEditionPerformance = {
  library: Pick<LibraryListItem, "id" | "name" | "slug">;
  summary: LibraryPublisherPerformance["summary"];
  editions: LibraryEditionPerformanceRow[];
};

export type LibraryListQuery = {
  page?: number;
  limit?: number;
  search?: string;
  isActive?: boolean;
  publisherId?: string;
};

export type FormState = {
  error?: string;
  fieldErrors?: Record<string, string>;
};

export function canManageLibraries(role: string): boolean {
  return role === "SUPER_ADMIN" || role === "PUBLISHER_ADMIN";
}
