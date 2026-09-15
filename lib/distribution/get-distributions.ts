import { redirect } from "next/navigation";
import { apiServerFetch, ApiError, readApiError } from "@/lib/api/server";
import type {
  DistributionDetail,
  DistributionListItem,
  DistributionListQuery,
  DistributionSummary,
  Paginated,
} from "@/lib/distribution/types";

function searchParamsFrom(query: DistributionListQuery): string {
  const params = new URLSearchParams();
  params.set("page", String(query.page ?? 1));
  params.set("limit", String(query.limit ?? 20));
  if (query.search) {
    params.set("search", query.search);
  }
  if (query.status && query.status !== "all") {
    params.set("status", query.status);
  }
  if (query.libraryId) {
    params.set("libraryId", query.libraryId);
  }
  return params.toString();
}

export async function getDistributions(
  query: DistributionListQuery = {},
): Promise<Paginated<DistributionListItem>> {
  const response = await apiServerFetch(
    `/api/v1/distributions?${searchParamsFrom(query)}`,
  );

  if (response.status === 401) {
    redirect("/login");
  }
  if (!response.ok) {
    throw new ApiError(await readApiError(response), response.status);
  }

  const body = (await response.json()) as Paginated<DistributionListItem>;
  if (!Array.isArray(body.data) || !body.meta) {
    throw new ApiError("Distributions response was malformed.", 502);
  }
  return body;
}

export async function getDistributionSummary(
  query: DistributionListQuery = {},
): Promise<DistributionSummary> {
  const response = await apiServerFetch(
    `/api/v1/distributions/summary?${searchParamsFrom(query)}`,
  );
  if (response.status === 401) {
    redirect("/login");
  }
  if (!response.ok) {
    throw new ApiError(await readApiError(response), response.status);
  }
  return (await response.json()) as DistributionSummary;
}

export async function getDistribution(id: string): Promise<DistributionDetail> {
  const response = await apiServerFetch(`/api/v1/distributions/${id}`);

  if (response.status === 401) {
    redirect("/login");
  }
  if (response.status === 404 || response.status === 403) {
    throw new ApiError("Shipment not found.", 404);
  }
  if (!response.ok) {
    throw new ApiError(await readApiError(response), response.status);
  }

  return (await response.json()) as DistributionDetail;
}
