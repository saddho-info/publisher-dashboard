import { redirect } from "next/navigation";
import { apiServerFetch, readApiError } from "@/lib/api/server";
import {
  DEFAULT_OVERVIEW_PERIOD,
  type OverviewPeriod,
  type OverviewSnapshot,
} from "@/lib/overview/types";

export class OverviewLoadError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
    this.name = "OverviewLoadError";
  }
}

export async function getOverview(
  period: OverviewPeriod = DEFAULT_OVERVIEW_PERIOD,
): Promise<OverviewSnapshot> {
  const response = await apiServerFetch(
    `/api/v1/analytics/overview?period=${encodeURIComponent(period)}`,
  );

  if (response.status === 401) {
    redirect("/login");
  }

  if (!response.ok) {
    throw new OverviewLoadError(
      await readApiError(response),
      response.status,
    );
  }

  const body = (await response.json()) as OverviewSnapshot;
  if (!isOverviewSnapshot(body)) {
    throw new OverviewLoadError("Overview response was malformed.", 502);
  }

  return body;
}

function isOverviewSnapshot(value: unknown): value is OverviewSnapshot {
  if (!value || typeof value !== "object") {
    return false;
  }
  const snapshot = value as OverviewSnapshot;
  return (
    typeof snapshot.generatedAt === "string" &&
    (snapshot.source === "live" || snapshot.source === "stub") &&
    typeof snapshot.kpis?.totalInventory === "number" &&
    typeof snapshot.kpis?.distributed === "number" &&
    typeof snapshot.kpis?.sold === "number" &&
    Array.isArray(snapshot.libraries) &&
    Array.isArray(snapshot.lowStock) &&
    Array.isArray(snapshot.topBooks) &&
    Array.isArray(snapshot.activity)
  );
}
