import { redirect } from "next/navigation";
import { apiServerFetch, readApiError } from "@/lib/api/server";
import {
  DEFAULT_OVERVIEW_PERIOD,
  type OverviewPeriod,
  type OverviewLibraryRank,
  type OverviewSnapshot,
  type OverviewTopBook,
} from "@/lib/overview/types";
import { getOverview } from "@/lib/overview/get-overview";

export class AnalyticsLoadError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
    this.name = "AnalyticsLoadError";
  }
}

export function getAnalyticsOverview(
  period: OverviewPeriod = DEFAULT_OVERVIEW_PERIOD,
): Promise<OverviewSnapshot> {
  return getOverview(period);
}

type SliceResponse<T> = {
  period: OverviewSnapshot["period"];
  data: T[];
};

async function fetchAnalyticsSlice<T>(
  path: string,
  period: OverviewPeriod,
): Promise<SliceResponse<T>> {
  const response = await apiServerFetch(
    `${path}?period=${encodeURIComponent(period)}`,
  );

  if (response.status === 401) {
    redirect("/login");
  }

  if (!response.ok) {
    throw new AnalyticsLoadError(
      await readApiError(response),
      response.status,
    );
  }

  const body = (await response.json()) as SliceResponse<T>;
  if (!body?.period || !Array.isArray(body.data)) {
    throw new AnalyticsLoadError("Analytics response was malformed.", 502);
  }

  return body;
}

export async function getTopBooks(
  period: OverviewPeriod = DEFAULT_OVERVIEW_PERIOD,
): Promise<SliceResponse<OverviewTopBook>> {
  return fetchAnalyticsSlice<OverviewTopBook>(
    "/api/v1/analytics/top-books",
    period,
  );
}

export async function getLibraryPerformance(
  period: OverviewPeriod = DEFAULT_OVERVIEW_PERIOD,
): Promise<SliceResponse<OverviewLibraryRank>> {
  return fetchAnalyticsSlice<OverviewLibraryRank>(
    "/api/v1/analytics/library-performance",
    period,
  );
}
