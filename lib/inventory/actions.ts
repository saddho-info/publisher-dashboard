"use server";

import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { apiServerFetch, readApiError } from "@/lib/api/server";
import type { FormState } from "@/lib/inventory/types";

function emptyToUndefined(value: FormDataEntryValue | null): string | undefined {
  if (typeof value !== "string") {
    return undefined;
  }
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

export async function generateCopiesAction(
  editionId: string,
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const raw = emptyToUndefined(formData.get("quantity"));
  const quantity = raw ? Number(raw) : NaN;
  if (!Number.isInteger(quantity) || quantity < 1 || quantity > 1000) {
    return {
      error: "Enter a whole number between 1 and 1000.",
      fieldErrors: { quantity: "Enter 1–1000 copies." },
    };
  }

  const response = await apiServerFetch("/api/v1/copies/bulk", {
    method: "POST",
    headers: { "Idempotency-Key": randomUUID() },
    body: JSON.stringify({
      editionId,
      quantity,
      reason: emptyToUndefined(formData.get("reason")),
    }),
  });

  if (response.status === 401) {
    redirect("/login");
  }
  if (!response.ok) {
    return { error: await readApiError(response) };
  }

  revalidatePath("/inventory");
  revalidatePath(`/inventory/${editionId}`);
  revalidatePath("/books");
  redirect(`/inventory/${editionId}`);
}

export async function updateThresholdAction(
  editionId: string,
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const raw = emptyToUndefined(formData.get("lowStockThreshold"));
  const lowStockThreshold = raw ? Number(raw) : NaN;
  if (!Number.isInteger(lowStockThreshold) || lowStockThreshold < 0) {
    return {
      error: "Threshold must be a whole number of 0 or more.",
      fieldErrors: { lowStockThreshold: "Enter 0 or more." },
    };
  }

  const response = await apiServerFetch("/api/v1/inventory/threshold", {
    method: "PATCH",
    body: JSON.stringify({ editionId, lowStockThreshold }),
  });

  if (response.status === 401) {
    redirect("/login");
  }
  if (!response.ok) {
    return { error: await readApiError(response) };
  }

  revalidatePath("/inventory");
  revalidatePath(`/inventory/${editionId}`);
  return {};
}
