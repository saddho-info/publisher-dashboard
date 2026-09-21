import type { PaginationMeta, Paginated } from "@/lib/books/types";

export type { PaginationMeta, Paginated };

export type PublisherListItem = {
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
};

export type PublisherDetail = PublisherListItem;

export type PublisherListQuery = {
  page?: number;
  limit?: number;
  search?: string;
  isActive?: boolean;
};

export type FormState = {
  error?: string;
  fieldErrors?: Record<string, string>;
};

export function canManagePublishers(role: string): boolean {
  return role === "SUPER_ADMIN";
}
