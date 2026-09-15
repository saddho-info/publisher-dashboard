"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { apiServerFetch, readApiError } from "@/lib/api/server";
import { parseMoneyToCents } from "@/lib/books/format";
import { BOOK_FORMATS, type FormState } from "@/lib/books/types";

function emptyToUndefined(value: FormDataEntryValue | null): string | undefined {
  if (typeof value !== "string") {
    return undefined;
  }
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

function checkboxActive(formData: FormData): boolean {
  return formData.get("isActive") === "on" || formData.get("isActive") === "true";
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

  revalidatePath("/books");
  redirect(successPath);
}

export async function createBookAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const title = emptyToUndefined(formData.get("title"));
  const authors = emptyToUndefined(formData.get("authors"));
  if (!title || !authors) {
    return {
      error: "Title and authors are required.",
      fieldErrors: {
        ...(title ? {} : { title: "Title is required." }),
        ...(authors ? {} : { authors: "Authors are required." }),
      },
    };
  }

  const response = await apiServerFetch("/api/v1/books", {
    method: "POST",
    body: JSON.stringify({
      title,
      authors,
      subtitle: emptyToUndefined(formData.get("subtitle")),
      description: emptyToUndefined(formData.get("description")),
      language: emptyToUndefined(formData.get("language")) ?? "en",
      category: emptyToUndefined(formData.get("category")),
      coverImageUrl: emptyToUndefined(formData.get("coverImageUrl")),
      slug: emptyToUndefined(formData.get("slug")),
      publisherId: emptyToUndefined(formData.get("publisherId")),
      isActive: checkboxActive(formData),
    }),
  });

  if (response.status === 401) {
    redirect("/login");
  }
  if (!response.ok) {
    return { error: await readApiError(response) };
  }

  const book = (await response.json()) as { id: string };
  revalidatePath("/books");
  redirect(`/books/${book.id}`);
}

export async function updateBookAction(
  bookId: string,
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const title = emptyToUndefined(formData.get("title"));
  const authors = emptyToUndefined(formData.get("authors"));
  if (!title || !authors) {
    return {
      error: "Title and authors are required.",
      fieldErrors: {
        ...(title ? {} : { title: "Title is required." }),
        ...(authors ? {} : { authors: "Authors are required." }),
      },
    };
  }

  const response = await apiServerFetch(`/api/v1/books/${bookId}`, {
    method: "PATCH",
    body: JSON.stringify({
      title,
      authors,
      subtitle: emptyToUndefined(formData.get("subtitle")) ?? null,
      description: emptyToUndefined(formData.get("description")) ?? null,
      language: emptyToUndefined(formData.get("language")) ?? "en",
      category: emptyToUndefined(formData.get("category")) ?? null,
      coverImageUrl: emptyToUndefined(formData.get("coverImageUrl")) ?? null,
      slug: emptyToUndefined(formData.get("slug")),
      isActive: checkboxActive(formData),
    }),
  });

  return handleMutation(response, `/books/${bookId}`);
}

export async function createEditionAction(
  bookId: string,
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const parsed = parseEditionForm(formData);
  if (!parsed.ok) {
    return parsed;
  }

  const response = await apiServerFetch("/api/v1/editions", {
    method: "POST",
    body: JSON.stringify({ bookId, ...parsed.data }),
  });

  return handleMutation(response, `/books/${bookId}`);
}

export async function updateEditionAction(
  bookId: string,
  editionId: string,
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const parsed = parseEditionForm(formData);
  if (!parsed.ok) {
    return parsed;
  }

  const response = await apiServerFetch(`/api/v1/editions/${editionId}`, {
    method: "PATCH",
    body: JSON.stringify(parsed.data),
  });

  return handleMutation(response, `/books/${bookId}`);
}

function parseEditionForm(
  formData: FormData,
): { ok: true; data: Record<string, unknown> } | ({ ok: false } & FormState) {
  const isbn = emptyToUndefined(formData.get("isbn"));
  const format = emptyToUndefined(formData.get("format"));
  const priceRaw = emptyToUndefined(formData.get("listPrice"));
  const fieldErrors: Record<string, string> = {};

  if (!isbn) {
    fieldErrors.isbn = "ISBN-13 is required.";
  }
  if (!format || !BOOK_FORMATS.includes(format as (typeof BOOK_FORMATS)[number])) {
    fieldErrors.format = "Choose a format.";
  }

  const listPriceCents = priceRaw ? parseMoneyToCents(priceRaw) : null;
  if (listPriceCents === null) {
    fieldErrors.listPrice = "Enter a price like 14.99.";
  }

  const pageRaw = emptyToUndefined(formData.get("pageCount"));
  let pageCount: number | undefined;
  if (pageRaw) {
    pageCount = Number(pageRaw);
    if (!Number.isInteger(pageCount) || pageCount < 1) {
      fieldErrors.pageCount = "Page count must be a whole number.";
    }
  }

  if (Object.keys(fieldErrors).length > 0) {
    return { ok: false, error: "Please fix the highlighted fields.", fieldErrors };
  }

  return {
    ok: true,
    data: {
      isbn,
      isbn10: emptyToUndefined(formData.get("isbn10")) ?? null,
      format,
      title: emptyToUndefined(formData.get("title")) ?? null,
      publicationDate: emptyToUndefined(formData.get("publicationDate")) ?? null,
      pageCount,
      listPriceCents,
      currency: emptyToUndefined(formData.get("currency")) ?? "USD",
      coverImageUrl: emptyToUndefined(formData.get("coverImageUrl")) ?? null,
      isActive: checkboxActive(formData),
    },
  };
}
