import type { BookFormat, PaginationMeta, Paginated } from "@/lib/books/types";

export type { PaginationMeta, Paginated };

export const DISTRIBUTION_STATUSES = [
  "DRAFT",
  "DISPATCHED",
  "PARTIALLY_RECEIVED",
  "RECEIVED",
  "CANCELLED",
] as const;

export type DistributionStatus = (typeof DISTRIBUTION_STATUSES)[number];

export type DistributionLibrary = {
  id: string;
  name: string;
  slug: string;
};

export type DistributionPublisher = {
  id: string;
  name: string;
  slug: string;
};

export type DistributionActor = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
};

export type DistributionCopy = {
  id: string;
  copyNumber: number;
  status: string;
};

export type DistributionItem = {
  id: string;
  editionId: string;
  quantity: number;
  createdAt: string;
  edition: {
    id: string;
    isbn: string;
    format: BookFormat;
    title: string | null;
    book: {
      id: string;
      title: string;
      authors: string;
      slug: string;
    };
  };
  copies: DistributionCopy[];
};

export type DistributionListItem = {
  id: string;
  publisherId: string;
  libraryId: string;
  status: DistributionStatus;
  code: string;
  notes: string | null;
  actorUserId: string;
  dispatchedAt: string | null;
  cancelledAt: string | null;
  createdAt: string;
  updatedAt: string;
  totalQuantity: number;
  itemCount: number;
  publisher: DistributionPublisher;
  library: DistributionLibrary;
  actor: DistributionActor;
  items: DistributionItem[];
};

export type DistributionDetail = DistributionListItem;

export type DistributionSummary = {
  draft: number;
  dispatched: number;
  partiallyReceived: number;
  received: number;
  cancelled: number;
  total: number;
  copiesInTransit: number;
};

export type DistributionListQuery = {
  page?: number;
  limit?: number;
  search?: string;
  status?: DistributionStatus | "all";
  libraryId?: string;
};

export type FormState = {
  error?: string;
  fieldErrors?: Record<string, string>;
};

export function canWriteDistributions(role: string): boolean {
  return (
    role === "SUPER_ADMIN" ||
    role === "PUBLISHER_ADMIN" ||
    role === "PUBLISHER_STAFF"
  );
}
