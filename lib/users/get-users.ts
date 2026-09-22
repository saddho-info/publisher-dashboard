import { redirect } from "next/navigation";
import { apiServerFetch, ApiError, readApiError } from "@/lib/api/server";
import type {
  LibraryUser,
  LibraryUserListQuery,
  Paginated,
  UserListQuery,
} from "@/lib/users/types";

export async function getUsers(
  query: UserListQuery = {},
): Promise<Paginated<LibraryUser>> {
  const params = new URLSearchParams();
  params.set("page", String(query.page ?? 1));
  params.set("limit", String(query.limit ?? 20));
  if (query.search) params.set("search", query.search);
  if (query.isActive !== undefined) params.set("isActive", String(query.isActive));
  if (query.role) params.set("role", query.role);
  if (query.publisherId) params.set("publisherId", query.publisherId);
  if (query.libraryId) params.set("libraryId", query.libraryId);

  const response = await apiServerFetch(`/api/v1/users?${params.toString()}`);
  if (response.status === 401) redirect("/login");
  if (!response.ok) {
    throw new ApiError(await readApiError(response), response.status);
  }
  const body = (await response.json()) as Paginated<LibraryUser>;
  if (!Array.isArray(body.data) || !body.meta) {
    throw new ApiError("Users response was malformed.", 502);
  }
  return body;
}

function searchParamsFrom(
  query: LibraryUserListQuery,
  includeLibraryId: boolean,
): string {
  const params = new URLSearchParams();
  params.set("page", String(query.page ?? 1));
  params.set("limit", String(query.limit ?? 50));
  if (includeLibraryId) {
    params.set("libraryId", query.libraryId);
  }
  if (query.search) {
    params.set("search", query.search);
  }
  if (query.isActive !== undefined) {
    params.set("isActive", String(query.isActive));
  }
  return params.toString();
}

async function fetchUsersPage(
  query: LibraryUserListQuery,
  includeLibraryId: boolean,
): Promise<Paginated<LibraryUser>> {
  const response = await apiServerFetch(
    `/api/v1/users?${searchParamsFrom(query, includeLibraryId)}`,
  );

  if (response.status === 401) {
    redirect("/login");
  }
  if (!response.ok) {
    throw new ApiError(await readApiError(response), response.status);
  }

  const body = (await response.json()) as Paginated<LibraryUser>;
  if (!Array.isArray(body.data) || !body.meta) {
    throw new ApiError("Users response was malformed.", 502);
  }
  return body;
}

export async function getLibraryUsers(
  query: LibraryUserListQuery,
): Promise<Paginated<LibraryUser>> {
  try {
    const body = await fetchUsersPage(query, true);
    return {
      data: body.data.filter((user) => user.libraryId === query.libraryId),
      meta: body.meta,
    };
  } catch (error) {
    // Older API builds reject unknown libraryId; fall back and filter client-side.
    if (!(error instanceof ApiError) || error.status !== 400) {
      throw error;
    }
    const body = await fetchUsersPage(
      { ...query, page: 1, limit: 100 },
      false,
    );
    const data = body.data.filter((user) => user.libraryId === query.libraryId);
    return {
      data,
      meta: {
        page: 1,
        limit: data.length,
        total: data.length,
        totalPages: data.length === 0 ? 0 : 1,
      },
    };
  }
}

export async function getLibraryUser(id: string): Promise<LibraryUser> {
  const response = await apiServerFetch(`/api/v1/users/${id}`);

  if (response.status === 401) {
    redirect("/login");
  }
  if (response.status === 404 || response.status === 403) {
    throw new ApiError("User not found.", 404);
  }
  if (!response.ok) {
    throw new ApiError(await readApiError(response), response.status);
  }

  return (await response.json()) as LibraryUser;
}
