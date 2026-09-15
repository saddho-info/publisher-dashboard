"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { apiServerFetch, readApiError } from "@/lib/api/server";
import type { FormState } from "@/lib/libraries/types";

function emptyToUndefined(value: FormDataEntryValue | null): string | undefined {
  if (typeof value !== "string") {
    return undefined;
  }
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

function checkboxActive(formData: FormData, name: string): boolean {
  const raw = formData.get(name);
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

  revalidatePath("/libraries");
  redirect(successPath);
}

export async function createLibraryAction(
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

  const response = await apiServerFetch("/api/v1/libraries", {
    method: "POST",
    body: JSON.stringify({
      name,
      slug: emptyToUndefined(formData.get("slug")),
      email: emptyToUndefined(formData.get("email")),
      phone: emptyToUndefined(formData.get("phone")),
      address: emptyToUndefined(formData.get("address")),
      publisherId: emptyToUndefined(formData.get("publisherId")),
      notes: emptyToUndefined(formData.get("notes")),
      isActive: checkboxActive(formData, "isActive"),
    }),
  });

  if (response.status === 401) {
    redirect("/login");
  }
  if (!response.ok) {
    return { error: await readApiError(response) };
  }

  const library = (await response.json()) as { id: string };
  revalidatePath("/libraries");
  redirect(`/libraries/${library.id}`);
}

export async function updateLibraryAction(
  libraryId: string,
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

  const response = await apiServerFetch(`/api/v1/libraries/${libraryId}`, {
    method: "PATCH",
    body: JSON.stringify({
      name,
      slug: emptyToUndefined(formData.get("slug")),
      email: emptyToUndefined(formData.get("email")) ?? null,
      phone: emptyToUndefined(formData.get("phone")) ?? null,
      address: emptyToUndefined(formData.get("address")) ?? null,
      isActive: checkboxActive(formData, "isActive"),
    }),
  });

  return handleMutation(response, `/libraries/${libraryId}`);
}

export async function linkLibraryAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const slug = emptyToUndefined(formData.get("slug"));
  if (!slug) {
    return {
      error: "Library slug is required.",
      fieldErrors: { slug: "Enter the library slug." },
    };
  }

  const response = await apiServerFetch("/api/v1/libraries/links", {
    method: "POST",
    body: JSON.stringify({
      slug,
      publisherId: emptyToUndefined(formData.get("publisherId")),
      notes: emptyToUndefined(formData.get("notes")),
    }),
  });

  if (response.status === 401) {
    redirect("/login");
  }
  if (!response.ok) {
    return { error: await readApiError(response) };
  }

  const library = (await response.json()) as { id: string };
  revalidatePath("/libraries");
  redirect(`/libraries/${library.id}`);
}

export async function updateLibraryLinkAction(
  libraryId: string,
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const response = await apiServerFetch(`/api/v1/libraries/${libraryId}/link`, {
    method: "PATCH",
    body: JSON.stringify({
      notes: emptyToUndefined(formData.get("notes")) ?? null,
      isActive: checkboxActive(formData, "linkActive"),
      publisherId: emptyToUndefined(formData.get("publisherId")),
    }),
  });

  return handleMutation(response, `/libraries/${libraryId}`);
}

export async function unlinkLibraryAction(
  libraryId: string,
  publisherId?: string,
): Promise<FormState> {
  const path = publisherId
    ? `/api/v1/libraries/${libraryId}/link?publisherId=${encodeURIComponent(publisherId)}`
    : `/api/v1/libraries/${libraryId}/link`;

  const response = await apiServerFetch(path, { method: "DELETE" });

  if (response.status === 401) {
    redirect("/login");
  }
  if (!response.ok) {
    return { error: await readApiError(response) };
  }

  revalidatePath("/libraries");
  redirect("/libraries");
}
