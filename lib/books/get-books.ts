import { redirect } from "next/navigation";
import { apiServerFetch, ApiError, readApiError } from "@/lib/api/server";
import type {
  BookDetail,
  BookListItem,
  BookListQuery,
  EditionDetail,
  Paginated,
} from "@/lib/books/types";

function searchParamsFrom(query: BookListQuery): string {
  const params = new URLSearchParams();
  params.set("page", String(query.page ?? 1));
  params.set("limit", String(query.limit ?? 20));
  if (query.search) {
    params.set("search", query.search);
  }
  if (query.isActive !== undefined) {
    params.set("isActive", String(query.isActive));
  }
  return params.toString();
}

export async function getBooks(
  query: BookListQuery = {},
): Promise<Paginated<BookListItem>> {
  const response = await apiServerFetch(
    `/api/v1/books?${searchParamsFrom(query)}`,
  );

  if (response.status === 401) {
    redirect("/login");
  }
  if (!response.ok) {
    throw new ApiError(await readApiError(response), response.status);
  }

  const body = (await response.json()) as Paginated<BookListItem>;
  if (!Array.isArray(body.data) || !body.meta) {
    throw new ApiError("Books response was malformed.", 502);
  }
  return body;
}

export async function getBook(id: string): Promise<BookDetail> {
  const response = await apiServerFetch(`/api/v1/books/${id}`);

  if (response.status === 401) {
    redirect("/login");
  }
  if (response.status === 404) {
    throw new ApiError("Book not found.", 404);
  }
  if (!response.ok) {
    throw new ApiError(await readApiError(response), response.status);
  }

  return (await response.json()) as BookDetail;
}

export async function getEdition(id: string): Promise<EditionDetail> {
  const response = await apiServerFetch(`/api/v1/editions/${id}`);

  if (response.status === 401) {
    redirect("/login");
  }
  if (response.status === 404) {
    throw new ApiError("Edition not found.", 404);
  }
  if (!response.ok) {
    throw new ApiError(await readApiError(response), response.status);
  }

  return (await response.json()) as EditionDetail;
}

export async function getPublishersForSelect(): Promise<
  Array<{ id: string; name: string }>
> {
  const response = await apiServerFetch("/api/v1/publishers?limit=100");
  if (!response.ok) {
    return [];
  }
  const body = (await response.json()) as {
    data?: Array<{ id: string; name: string }>;
  };
  return Array.isArray(body.data)
    ? body.data.map((row) => ({ id: row.id, name: row.name }))
    : [];
}
