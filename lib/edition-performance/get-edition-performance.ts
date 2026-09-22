import { redirect } from "next/navigation";
import { apiServerFetch, ApiError, readApiError } from "@/lib/api/server";
import {
  EDITION_SEARCH_LIMIT,
  MIN_EDITION_SEARCH_LENGTH,
} from "@/lib/edition-performance/constants";
import type {
  EditionPerformanceReport,
  EditionSearchResult,
} from "@/lib/edition-performance/types";
import {
  isEditionPerformanceReport,
  isEditionSearchResult,
} from "@/lib/edition-performance/validate";

async function readJsonBody(response: Response): Promise<unknown> {
  return response.json().catch(() => null);
}

/**
 * Backs the internal `/api/editions/search` handler, so a 401 is surfaced to the
 * caller as JSON instead of a redirect the browser cannot act on.
 */
export async function searchEditions(
  search: string,
  limit: number = EDITION_SEARCH_LIMIT,
): Promise<EditionSearchResult> {
  const query = search.trim();
  if (query.length < MIN_EDITION_SEARCH_LENGTH) {
    throw new ApiError(
      `Enter at least ${MIN_EDITION_SEARCH_LENGTH} characters to search editions.`,
      400,
    );
  }

  const params = new URLSearchParams({
    search: query,
    page: "1",
    limit: String(limit),
  });
  const response = await apiServerFetch(`/api/v1/editions?${params.toString()}`);

  if (!response.ok) {
    throw new ApiError(await readApiError(response), response.status);
  }

  const body = await readJsonBody(response);
  if (!isEditionSearchResult(body)) {
    throw new ApiError("Edition search response was malformed.", 502);
  }
  return body;
}

export async function getEditionLibraryPerformance(
  editionId: string,
): Promise<EditionPerformanceReport> {
  const id = editionId.trim();
  if (!id) {
    throw new ApiError("Select an edition to load its performance.", 400);
  }

  const response = await apiServerFetch(
    `/api/v1/editions/${encodeURIComponent(id)}/library-performance`,
  );

  if (response.status === 401) {
    redirect("/login");
  }
  if (response.status === 403) {
    throw new ApiError(
      "You do not have access to this edition's performance.",
      403,
    );
  }
  if (response.status === 404) {
    throw new ApiError("Edition not found.", 404);
  }
  if (!response.ok) {
    throw new ApiError(await readApiError(response), response.status);
  }

  const body = await readJsonBody(response);
  if (!isEditionPerformanceReport(body)) {
    throw new ApiError("Edition performance response was malformed.", 502);
  }
  if (body.edition.id !== id) {
    throw new ApiError(
      "Edition performance response did not match the selected edition.",
      502,
    );
  }
  return body;
}
