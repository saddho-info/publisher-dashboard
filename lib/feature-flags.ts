"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { apiServerFetch, ApiError, readApiError } from "@/lib/api/server";

export type FeatureFlagOverride = {
  id: string;
  publisherId: string | null;
  libraryId: string | null;
  enabled: boolean;
};
export type FeatureFlag = {
  id: string;
  key: string;
  name: string;
  description: string | null;
  isActive: boolean;
  overrides: FeatureFlagOverride[];
};
export type FeatureFlagState = { error?: string; fieldErrors?: Record<string, string> };

async function request(path: string, init?: RequestInit): Promise<Response> {
  const response = await apiServerFetch(path, init);
  if (response.status === 401) redirect("/login");
  return response;
}

export async function getFeatureFlags(): Promise<FeatureFlag[]> {
  const response = await request("/api/v1/feature-flags");
  if (!response.ok) throw new ApiError(await readApiError(response), response.status);
  const body = (await response.json()) as FeatureFlag[] | { data: FeatureFlag[] };
  return Array.isArray(body) ? body : body.data ?? [];
}

export async function getFeatureFlag(id: string): Promise<FeatureFlag> {
  const response = await request(`/api/v1/feature-flags/${id}`);
  if (!response.ok) throw new ApiError(await readApiError(response), response.status);
  return response.json() as Promise<FeatureFlag>;
}

function text(data: FormData, key: string): string {
  return String(data.get(key) ?? "").trim();
}

export async function saveFeatureFlagAction(id: string | null, _state: FeatureFlagState, data: FormData): Promise<FeatureFlagState> {
  const key = text(data, "key");
  const name = text(data, "name");
  if (!key || !name) return { error: "Key and name are required.", fieldErrors: { ...(!key ? { key: "Required." } : {}), ...(!name ? { name: "Required." } : {}) } };
  const response = await request(id ? `/api/v1/feature-flags/${id}` : "/api/v1/feature-flags", {
    method: id ? "PATCH" : "POST",
    body: JSON.stringify({ key, name, description: text(data, "description"), isActive: data.get("enabled") === "on" }),
  });
  if (!response.ok) return { error: await readApiError(response) };
  revalidatePath("/feature-flags");
  redirect("/feature-flags");
}

export async function addFeatureFlagOverrideAction(flagId: string, data: FormData): Promise<void> {
  const publisherId = text(data, "publisherId");
  const libraryId = text(data, "libraryId");
  if (!publisherId && !libraryId) throw new Error("A publisher or library ID is required.");
  const response = await request(`/api/v1/feature-flags/${flagId}/overrides`, {
    method: "PUT",
    body: JSON.stringify({
      scope: publisherId ? "PUBLISHER" : "LIBRARY",
      publisherId: publisherId || undefined,
      libraryId: libraryId || undefined,
      enabled: data.get("enabled") === "on",
    }),
  });
  if (!response.ok) throw new Error(await readApiError(response));
  revalidatePath(`/feature-flags/${flagId}/edit`);
}

export async function deleteFeatureFlagAction(id: string): Promise<void> {
  const response = await request(`/api/v1/feature-flags/${id}`, { method: "DELETE" });
  if (!response.ok) throw new Error(await readApiError(response));
  revalidatePath("/feature-flags");
}

export async function deleteFeatureFlagOverrideAction(flagId: string, overrideId: string): Promise<void> {
  const response = await request(`/api/v1/feature-flags/${flagId}/overrides/${overrideId}`, { method: "DELETE" });
  if (!response.ok) throw new Error(await readApiError(response));
  revalidatePath(`/feature-flags/${flagId}/edit`);
}
