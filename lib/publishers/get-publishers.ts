import { redirect } from "next/navigation";
import { apiServerFetch, ApiError, readApiError } from "@/lib/api/server";
import type {
  Paginated,
  PublisherDetail,
  PublisherListItem,
  PublisherListQuery,
} from "@/lib/publishers/types";

function searchParamsFrom(query: PublisherListQuery): string {
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

export async function getPublishers(
  query: PublisherListQuery = {},
): Promise<Paginated<PublisherListItem>> {
  const response = await apiServerFetch(
    `/api/v1/publishers?${searchParamsFrom(query)}`,
  );

  if (response.status === 401) {
    redirect("/login");
  }
  if (!response.ok) {
    throw new ApiError(await readApiError(response), response.status);
  }

  const body = (await response.json()) as Paginated<PublisherListItem>;
  if (!Array.isArray(body.data) || !body.meta) {
    throw new ApiError("Publishers response was malformed.", 502);
  }
  return body;
}

export async function getPublisher(id: string): Promise<PublisherDetail> {
  const response = await apiServerFetch(`/api/v1/publishers/${id}`);

  if (response.status === 401) {
    redirect("/login");
  }
  if (response.status === 404 || response.status === 403) {
    throw new ApiError("Publisher not found.", 404);
  }
  if (!response.ok) {
    throw new ApiError(await readApiError(response), response.status);
  }

  return (await response.json()) as PublisherDetail;
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
