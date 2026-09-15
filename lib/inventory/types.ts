import type { BookFormat, PaginationMeta, Paginated } from "@/lib/books/types";

export type { PaginationMeta, Paginated };

export const COPY_STATUSES = [
  "IN_STOCK_PUBLISHER",
  "DISTRIBUTED",
  "IN_STOCK_LIBRARY",
  "SOLD",
  "RETURNED",
  "LOST",
] as const;

export type CopyStatus = (typeof COPY_STATUSES)[number];

export const MOVEMENT_TYPES = [
  "PRINT_RECEIPT",
  "DISTRIBUTION",
  "RECEIPT",
  "SALE",
  "RETURN",
  "ADJUSTMENT",
  "LOSS",
] as const;

export type MovementType = (typeof MOVEMENT_TYPES)[number];

export type InventoryBook = {
  id: string;
  title: string;
  authors: string;
  publisherId: string;
  slug: string;
  coverImageUrl: string | null;
};

export type InventoryHolding = {
  id: string;
  holderType: "PUBLISHER" | "LIBRARY";
  holderId: string;
  onHand: number;
  inTransit: number;
  sold: number;
  returned: number;
  lost: number;
  lowStockThreshold: number;
  version: number;
};

export type InventoryRollup = {
  editionId: string;
  isbn: string;
  isbn10: string | null;
  format: BookFormat;
  editionTitle: string | null;
  listPriceCents: number;
  currency: string;
  isActive: boolean;
  book: InventoryBook;
  warehouseOnHand: number;
  libraryOnHand: number;
  inTransit: number;
  sold: number;
  returned: number;
  lost: number;
  totalOnHand: number;
  lowStockThreshold: number;
  isLowStock: boolean;
  copyCount: number;
  holdings: InventoryHolding[];
};

export type InventorySummary = {
  warehouseOnHand: number;
  libraryOnHand: number;
  inTransit: number;
  sold: number;
  returned: number;
  lost: number;
  totalOnHand: number;
  lowStockCount: number;
};

export type InventoryCopy = {
  id: string;
  editionId: string;
  publisherId: string;
  libraryId: string | null;
  status: CopyStatus;
  copyNumber: number;
  createdAt: string;
  updatedAt: string;
  qrToken: string | null;
  qrImageDataUrl: string | null;
  edition: {
    id: string;
    isbn: string;
    format: BookFormat;
    title: string | null;
    listPriceCents: number;
    currency: string;
    coverImageUrl: string | null;
    book: InventoryBook;
  };
  library: { id: string; name: string; slug: string } | null;
};

export type InventoryMovement = {
  id: string;
  type: MovementType;
  editionId: string;
  copyId: string | null;
  quantity: number;
  fromHolderType: "PUBLISHER" | "LIBRARY" | null;
  fromHolderId: string | null;
  toHolderType: "PUBLISHER" | "LIBRARY" | null;
  toHolderId: string | null;
  actorUserId: string;
  reason: string | null;
  refType: string | null;
  refId: string | null;
  createdAt: string;
  edition: {
    id: string;
    isbn: string;
    format: BookFormat;
    title: string | null;
    book: { id: string; title: string; authors: string };
  };
  copy: { id: string; copyNumber: number; status: CopyStatus } | null;
  actor: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
};

export type CopyBatchResult = {
  id: string;
  editionId: string;
  publisherId: string;
  requestedQuantity: number;
  createdQuantity: number;
  status: "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED";
  idempotencyKey: string | null;
  createdAt: string;
  updatedAt: string;
};

export type InventoryListQuery = {
  page?: number;
  limit?: number;
  search?: string;
  lowStock?: boolean;
  editionId?: string;
};

export type CopyListQuery = {
  page?: number;
  limit?: number;
  editionId?: string;
  status?: CopyStatus | "all";
  copyNumber?: number;
};

export type MovementListQuery = {
  page?: number;
  limit?: number;
  editionId?: string;
  copyId?: string;
};

export type FormState = {
  error?: string;
  fieldErrors?: Record<string, string>;
};
