import type { PaginationMeta, Paginated } from "@/lib/books/types";

export type { PaginationMeta, Paginated };

export const LIBRARY_PORTAL_ROLES = ["LIBRARY_ADMIN", "LIBRARY_STAFF"] as const;

export type LibraryPortalRole = (typeof LIBRARY_PORTAL_ROLES)[number];

export type LibraryUser = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  isActive: boolean;
  publisherId: string | null;
  libraryId: string | null;
  createdAt: string;
  updatedAt: string;
};

export type LibraryUserListQuery = {
  page?: number;
  limit?: number;
  search?: string;
  isActive?: boolean;
  libraryId: string;
};

export type FormState = {
  error?: string;
  fieldErrors?: Record<string, string>;
};

export function canManageLibraryPortalAccess(role: string): boolean {
  return role === "SUPER_ADMIN";
}

export function isLibraryPortalRole(role: string): role is LibraryPortalRole {
  return (LIBRARY_PORTAL_ROLES as readonly string[]).includes(role);
}

export function formatLibraryPortalRole(role: string): string {
  switch (role) {
    case "LIBRARY_ADMIN":
      return "Library admin";
    case "LIBRARY_STAFF":
      return "Library staff";
    default:
      return role.replace(/_/g, " ").toLowerCase();
  }
}
