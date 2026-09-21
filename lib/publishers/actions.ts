"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { apiServerFetch, readApiError } from "@/lib/api/server";
import type { FormState } from "@/lib/publishers/types";

function emptyToUndefined(value: FormDataEntryValue | null): string | undefined {
  if (typeof value !== "string") {
    return undefined;
  }
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

function checkboxActive(formData: FormData): boolean {
  const raw = formData.get("isActive");
  return raw === "on" || raw === "true";
}

async function handleMutation(
  response: Response,
  successPath: string,
): Promise<FormState> {
  if (response.status === 401) {
    redirect("/login");
  }
  if (!response.ok) {
    return { error: await readApiError(response) };
  }

  revalidatePath("/publishers");
  redirect(successPath);
}

export async function createPublisherAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const name = emptyToUndefined(formData.get("name"));
  if (!name) {
    return {
      error: "Name is required.",
      fieldErrors: { name: "Name is required." },
    };
  }

  const response = await apiServerFetch("/api/v1/publishers", {
    method: "POST",
    body: JSON.stringify({
      name,
      slug: emptyToUndefined(formData.get("slug")),
      email: emptyToUndefined(formData.get("email")),
      phone: emptyToUndefined(formData.get("phone")),
      address: emptyToUndefined(formData.get("address")),
      isActive: checkboxActive(formData),
    }),
  });

  if (response.status === 401) {
    redirect("/login");
  }
  if (!response.ok) {
    return { error: await readApiError(response) };
  }

  const publisher = (await response.json()) as { id: string };
  revalidatePath("/publishers");
  redirect(`/publishers/${publisher.id}`);
}

export async function updatePublisherAction(
  publisherId: string,
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const name = emptyToUndefined(formData.get("name"));
  if (!name) {
    return {
      error: "Name is required.",
      fieldErrors: { name: "Name is required." },
    };
  }

  const response = await apiServerFetch(`/api/v1/publishers/${publisherId}`, {
    method: "PATCH",
    body: JSON.stringify({
      name,
      slug: emptyToUndefined(formData.get("slug")),
      email: emptyToUndefined(formData.get("email")) ?? null,
      phone: emptyToUndefined(formData.get("phone")) ?? null,
      address: emptyToUndefined(formData.get("address")) ?? null,
      isActive: checkboxActive(formData),
    }),
  });

  return handleMutation(response, `/publishers/${publisherId}`);
}
