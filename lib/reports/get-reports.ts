import { redirect } from "next/navigation";
import { apiServerFetch, readApiError } from "@/lib/api/server";
import type { AuditLogListResult } from "@/lib/reports/types";

export class AuditLoadError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
    this.name = "AuditLoadError";
  }
}

function searchParamsFrom(query: {
  page?: number;
  limit?: number;
  search?: string;
  entityType?: string;
  action?: string;
}): string {
  const params = new URLSearchParams();
  if (query.page) params.set("page", String(query.page));
  if (query.limit) params.set("limit", String(query.limit));
  if (query.search) params.set("search", query.search);
  if (query.entityType) params.set("entityType", query.entityType);
  if (query.action) params.set("action", query.action);
  return params.toString();
}

export async function getAuditLogs(query: {
  page?: number;
  limit?: number;
  search?: string;
  entityType?: string;
  action?: string;
} = {}): Promise<AuditLogListResult> {
  const response = await apiServerFetch(
    `/api/v1/audit-logs?${searchParamsFrom(query)}`,
  );

  if (response.status === 401) {
    redirect("/login");
  }

  if (!response.ok) {
    throw new AuditLoadError(await readApiError(response), response.status);
  }

  const body = (await response.json()) as AuditLogListResult;
  if (!body?.data || !body?.meta) {
    throw new AuditLoadError("Audit log response was malformed.", 502);
  }
  return body;
}

export function reportDownloadHref(
  kind: string,
  query: Record<string, string | undefined> = {},
): string {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value) params.set(key, value);
  }
  const qs = params.toString();
  return qs ? `/api/reports/${kind}?${qs}` : `/api/reports/${kind}`;
}
