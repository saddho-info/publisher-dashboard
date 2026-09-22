/** Shared between the client autocomplete and the internal search route handler. */
export const MIN_EDITION_SEARCH_LENGTH = 2;
export const EDITION_SEARCH_DEBOUNCE_MS = 300;
export const EDITION_SEARCH_LIMIT = 10;

export const EDITION_SEARCH_INPUT_ID = "edition-performance-search";
export const EDITION_PERFORMANCE_PATH = "/analytics/edition-performance";
export const EDITION_SEARCH_ENDPOINT = "/api/editions/search";

export function editionPerformanceHref(editionId: string): string {
  return `${EDITION_PERFORMANCE_PATH}?editionId=${encodeURIComponent(editionId)}`;
}
