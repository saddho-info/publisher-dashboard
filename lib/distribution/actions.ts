"use server";

import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { apiServerFetch, readApiError } from "@/lib/api/server";
import type { FormState } from "@/lib/distribution/types";

function emptyToUndefined(value: FormDataEntryValue | null): string | undefined {
  if (typeof value !== "string") {
    return undefined;
  }
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

function parseItems(formData: FormData): Array<{ editionId: string; quantity: number }> | FormState {
  const raw = emptyToUndefined(formData.get("items"));
  if (!raw) {
    return { error: "Add at least one edition line." };
  }
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed) || parsed.length === 0) {
      return { error: "Add at least one edition line." };
    }
    const items: Array<{ editionId: string; quantity: number }> = [];
    for (const row of parsed) {
      if (
        typeof row !== "object" ||
        row === null ||
        typeof (row as { editionId?: unknown }).editionId !== "string" ||
        typeof (row as { quantity?: unknown }).quantity !== "number"
      ) {
        return { error: "Shipment lines are invalid." };
      }
      const editionId = (row as { editionId: string }).editionId.trim();
      const quantity = (row as { quantity: number }).quantity;
      if (!editionId) {
        return {
          error: "Choose an edition for every line.",
          fieldErrors: { items: "Choose an edition for every line." },
        };
      }
      if (!Number.isInteger(quantity) || quantity < 1 || quantity > 1000) {
        return {
          error: "Quantity must be a whole number between 1 and 1000.",
          fieldErrors: { items: "Enter 1–1000 copies per line." },
        };
      }
      items.push({ editionId, quantity });
    }
    return items;
  } catch {
    return { error: "Shipment lines are invalid." };
  }
}

function revalidateDistribution(id?: string) {
  revalidatePath("/distribution");
  revalidatePath("/inventory");
  revalidatePath("/libraries");
  if (id) {
    revalidatePath(`/distribution/${id}`);
  }
}

export async function createDistributionAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const libraryId = emptyToUndefined(formData.get("libraryId"));
  if (!libraryId) {
    return {
      error: "Choose a library.",
      fieldErrors: { libraryId: "Choose a partner library." },
    };
  }

  const items = parseItems(formData);
  if (!Array.isArray(items)) {
    return items;
  }

  const response = await apiServerFetch("/api/v1/distributions", {
    method: "POST",
    headers: { "Idempotency-Key": randomUUID() },
    body: JSON.stringify({
      libraryId,
      publisherId: emptyToUndefined(formData.get("publisherId")),
      notes: emptyToUndefined(formData.get("notes")),
      items,
      dispatch: formData.get("dispatchNow") === "on",
    }),
  });

  if (response.status === 401) {
    redirect("/login");
  }
  if (!response.ok) {
    return { error: await readApiError(response) };
  }

  const created = (await response.json()) as { id: string };
  revalidateDistribution(created.id);
  redirect(`/distribution/${created.id}`);
}

export async function dispatchDistributionAction(
  distributionId: string,
): Promise<FormState> {
  const response = await apiServerFetch(
    `/api/v1/distributions/${distributionId}/dispatch`,
    { method: "PATCH" },
  );

  if (response.status === 401) {
    redirect("/login");
  }
  if (!response.ok) {
    return { error: await readApiError(response) };
  }

  revalidateDistribution(distributionId);
  redirect(`/distribution/${distributionId}?notice=dispatched`);
}

export async function cancelDistributionAction(
  distributionId: string,
): Promise<FormState> {
  const response = await apiServerFetch(
    `/api/v1/distributions/${distributionId}/cancel`,
    { method: "PATCH" },
  );

  if (response.status === 401) {
    redirect("/login");
  }
  if (!response.ok) {
    return { error: await readApiError(response) };
  }

  revalidateDistribution(distributionId);
  redirect(`/distribution/${distributionId}?notice=cancelled`);
}
