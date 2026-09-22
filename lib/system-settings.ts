"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { apiServerFetch, ApiError, readApiError } from "@/lib/api/server";

export type SystemSetting = {
  id: string;
  key: string;
  description: string | null;
  value: unknown;
  updatedAt?: string;
};
export type SystemSettingState = { error?: string; success?: string };

export async function getSystemSettings(): Promise<SystemSetting[]> {
  const response = await apiServerFetch("/api/v1/system-settings");
  if (response.status === 401) redirect("/login");
  if (!response.ok) throw new ApiError(await readApiError(response), response.status);
  const body = (await response.json()) as SystemSetting[] | { data: SystemSetting[] };
  return Array.isArray(body) ? body : body.data ?? [];
}

export async function updateSystemSettingAction(
  key: string,
  _state: SystemSettingState,
  data: FormData,
): Promise<SystemSettingState> {
  const raw = String(data.get("value") ?? "").trim();
  let value: unknown;
  try {
    value = JSON.parse(raw);
  } catch {
    return { error: "Enter valid JSON (for example: true, 25, or {\"mode\":\"safe\"})." };
  }
  const response = await apiServerFetch(`/api/v1/system-settings/${encodeURIComponent(key)}`, {
    method: "PATCH",
    body: JSON.stringify({ value }),
  });
  if (response.status === 401) redirect("/login");
  if (!response.ok) return { error: await readApiError(response) };
  revalidatePath("/system-settings");
  return { success: "Setting saved." };
}
