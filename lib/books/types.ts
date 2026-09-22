export const BOOK_FORMATS = [
  "HARDCOVER",
  "PAPERBACK",
  "MASS_MARKET",
  "BOARD_BOOK",
  "OTHER",
] as const;

export type BookFormat = (typeof BOOK_FORMATS)[number];

export type PaginationMeta = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export type Paginated<T> = {
  data: T[];
  meta: PaginationMeta;
};

export type BookPublisher = {
  id: string;
  name: string;
  slug: string;
};

export type Edition = {
  id: string;
  bookId: string;
  isbn: string;
  isbn10: string | null;
  format: BookFormat;
  title: string | null;
  publicationDate: string | null;
  pageCount: number | null;
  listPriceCents: number;
  currency: string;
  coverImageUrl: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type BookListItem = {
  id: string;
  publisherId: string;
  title: string;
  subtitle: string | null;
  authors: string;
  language: string;
  category: string | null;
  coverImageUrl: string | null;
  slug: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  publisher: BookPublisher;
  _count: { editions: number };
  /**
   * Publisher-scoped movement from GET /api/v1/books, summed across editions.
   * Absent when the list payload has not been enriched — do not N+1
   * edition-performance per row. Missing values render as "—".
   */
  libraryStock?: number;
  sold?: number;
  revenueByCurrency?: Array<{ currency: string; totalCents: number }>;
};

export type BookDetail = BookListItem & {
  description: string | null;
  editions: Edition[];
};

export type EditionDetail = Edition & {
  book: {
    id: string;
    title: string;
    authors: string;
    publisherId: string;
    slug: string;
    publisher: BookPublisher;
  };
};

export type BookListQuery = {
  page?: number;
  limit?: number;
  search?: string;
  isActive?: boolean;
};

export type FormState = {
  error?: string;
  fieldErrors?: Record<string, string>;
};
