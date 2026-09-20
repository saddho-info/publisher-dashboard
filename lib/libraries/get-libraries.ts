import { redirect } from "next/navigation";
import { apiServerFetch, ApiError, readApiError } from "@/lib/api/server";
import type {
  LibraryDetail,
  LibraryListItem,
  LibraryListQuery,
  LibraryPublisherPerformance,
  Paginated,
} from "@/lib/libraries/types";
import { isLibraryPublisherPerformance } from "@/lib/libraries/validate";

function searchParamsFrom(query: LibraryListQuery): string {
  const params = new URLSearchParams();
  params.set("page", String(query.page ?? 1));
  params.set("limit", String(query.limit ?? 20));
  if (query.search) {
    params.set("search", query.search);
  }
  if (query.isActive !== undefined) {
    params.set("isActive", String(query.isActive));
  }
  if (query.publisherId) {
    params.set("publisherId", query.publisherId);
  }
  return params.toString();
}

export async function getLibraries(
  query: LibraryListQuery = {},
): Promise<Paginated<LibraryListItem>> {
  const response = await apiServerFetch(
    `/api/v1/libraries?${searchParamsFrom(query)}`,
  );

  if (response.status === 401) {
    redirect("/login");
  }
  if (!response.ok) {
    throw new ApiError(await readApiError(response), response.status);
  }

  const body = (await response.json()) as Paginated<LibraryListItem>;
  if (!Array.isArray(body.data) || !body.meta) {
    throw new ApiError("Libraries response was malformed.", 502);
  }
  return body;
}

export async function getLibrary(id: string): Promise<LibraryDetail> {
  const response = await apiServerFetch(`/api/v1/libraries/${id}`);

  if (response.status === 401) {
    redirect("/login");
  }
  if (response.status === 404 || response.status === 403) {
    throw new ApiError("Library not found.", 404);
  }
  if (!response.ok) {
    throw new ApiError(await readApiError(response), response.status);
  }

  return (await response.json()) as LibraryDetail;
}

export async function getLibraryPublisherPerformance(
  id: string,
): Promise<LibraryPublisherPerformance> {
  const libraryId = id.trim();
  if (!libraryId) {
    throw new ApiError("Select a library to load its performance.", 400);
  }

  const response = await apiServerFetch(
    `/api/v1/libraries/${encodeURIComponent(libraryId)}/publisher-performance`,
  );

  if (response.status === 401) {
    redirect("/login");
  }
  if (response.status === 403) {
    throw new ApiError(
      "You do not have access to this library's performance.",
      403,
    );
  }
  if (response.status === 404) {
    throw new ApiError("Library not found.", 404);
  }
  if (!response.ok) {
    throw new ApiError(await readApiError(response), response.status);
  }

  const body: unknown = await response.json().catch(() => null);
  if (!isLibraryPublisherPerformance(body)) {
    throw new ApiError("Library performance response was malformed.", 502);
  }
  if (body.library.id !== libraryId) {
    throw new ApiError(
      "Library performance response did not match the selected library.",
      502,
    );
  }
  return body;
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
