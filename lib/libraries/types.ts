import type { PaginationMeta, Paginated } from "@/lib/books/types";

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
};

export type LibraryDetail = LibraryListItem;

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
