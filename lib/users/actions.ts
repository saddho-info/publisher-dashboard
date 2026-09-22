"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { apiServerFetch, readApiError } from "@/lib/api/server";
import {
  isLibraryPortalRole,
  USER_ROLES,
  type FormState,
} from "@/lib/users/types";

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

function revalidateLibraryUsers(libraryId: string) {
  revalidatePath(`/libraries/${libraryId}`);
  revalidatePath("/libraries");
}

export async function createLibraryUserAction(
  libraryId: string,
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const email = emptyToUndefined(formData.get("email"));
  const password = emptyToUndefined(formData.get("password"));
  const firstName = emptyToUndefined(formData.get("firstName"));
  const lastName = emptyToUndefined(formData.get("lastName"));
  const role = emptyToUndefined(formData.get("role")) ?? "LIBRARY_ADMIN";

  const fieldErrors: Record<string, string> = {};
  if (!email) fieldErrors.email = "Email is required.";
  if (!password) fieldErrors.password = "Temporary password is required.";
  else if (password.length < 8) {
    fieldErrors.password = "Use 8 or more characters.";
  }
  if (!firstName) fieldErrors.firstName = "First name is required.";
  if (!lastName) fieldErrors.lastName = "Last name is required.";
  if (!isLibraryPortalRole(role)) {
    return { error: "Role must be library admin or library staff." };
  }
  if (Object.keys(fieldErrors).length > 0) {
    return {
      error: "Fix the highlighted fields and try again.",
      fieldErrors,
    };
  }

  const response = await apiServerFetch("/api/v1/users", {
    method: "POST",
    body: JSON.stringify({
      email,
      password,
      firstName,
      lastName,
      role,
      libraryId,
      isActive: checkboxActive(formData),
    }),
  });

  if (response.status === 401) {
    redirect("/login");
  }
  if (!response.ok) {
    return { error: await readApiError(response) };
  }

  revalidateLibraryUsers(libraryId);
  redirect(`/libraries/${libraryId}?notice=portal_user_created`);
}

export async function updateLibraryUserAction(
  libraryId: string,
  userId: string,
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const email = emptyToUndefined(formData.get("email"));
  const password = emptyToUndefined(formData.get("password"));
  const firstName = emptyToUndefined(formData.get("firstName"));
  const lastName = emptyToUndefined(formData.get("lastName"));
  const role = emptyToUndefined(formData.get("role"));

  const fieldErrors: Record<string, string> = {};
  if (!email) fieldErrors.email = "Email is required.";
  if (!firstName) fieldErrors.firstName = "First name is required.";
  if (!lastName) fieldErrors.lastName = "Last name is required.";
  if (password && password.length < 8) {
    fieldErrors.password = "Use 8 or more characters.";
  }
  if (role && !isLibraryPortalRole(role)) {
    return { error: "Role must be library admin or library staff." };
  }
  if (Object.keys(fieldErrors).length > 0) {
    return {
      error: "Fix the highlighted fields and try again.",
      fieldErrors,
    };
  }

  const response = await apiServerFetch(`/api/v1/users/${userId}`, {
    method: "PATCH",
    body: JSON.stringify({
      email,
      firstName,
      lastName,
      ...(role ? { role } : {}),
      ...(password ? { password } : {}),
      libraryId,
      isActive: checkboxActive(formData),
    }),
  });

  if (response.status === 401) {
    redirect("/login");
  }
  if (!response.ok) {
    return { error: await readApiError(response) };
  }

  revalidateLibraryUsers(libraryId);
  redirect(`/libraries/${libraryId}?notice=portal_user_updated`);
}

function userPayload(formData: FormData, includePassword: boolean) {
  const password = emptyToUndefined(formData.get("password"));
  return {
    email: emptyToUndefined(formData.get("email")),
    firstName: emptyToUndefined(formData.get("firstName")),
    lastName: emptyToUndefined(formData.get("lastName")),
    role: emptyToUndefined(formData.get("role")),
    publisherId: emptyToUndefined(formData.get("publisherId")),
    libraryId: emptyToUndefined(formData.get("libraryId")),
    isActive: checkboxActive(formData),
    ...(includePassword || password ? { password } : {}),
  };
}

function validateUserPayload(
  payload: ReturnType<typeof userPayload>,
  passwordRequired: boolean,
): FormState | null {
  const fieldErrors: Record<string, string> = {};
  if (!payload.email) fieldErrors.email = "Email is required.";
  if (!payload.firstName) fieldErrors.firstName = "First name is required.";
  if (!payload.lastName) fieldErrors.lastName = "Last name is required.";
  if (!payload.role || !(USER_ROLES as readonly string[]).includes(payload.role)) {
    fieldErrors.role = "Select a valid role.";
  }
  if (passwordRequired && !payload.password) {
    fieldErrors.password = "Temporary password is required.";
  } else if (payload.password && payload.password.length < 8) {
    fieldErrors.password = "Use 8 or more characters.";
  }
  return Object.keys(fieldErrors).length
    ? { error: "Fix the highlighted fields and try again.", fieldErrors }
    : null;
}

export async function createUserAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const payload = userPayload(formData, true);
  const invalid = validateUserPayload(payload, true);
  if (invalid) return invalid;
  const response = await apiServerFetch("/api/v1/users", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  if (response.status === 401) redirect("/login");
  if (!response.ok) return { error: await readApiError(response) };
  revalidatePath("/users");
  redirect("/users?notice=user_created");
}

export async function updateUserAction(
  userId: string,
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const payload = userPayload(formData, false);
  const invalid = validateUserPayload(payload, false);
  if (invalid) return invalid;
  const response = await apiServerFetch(`/api/v1/users/${userId}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
  if (response.status === 401) redirect("/login");
  if (!response.ok) return { error: await readApiError(response) };
  revalidatePath("/users");
  redirect("/users?notice=user_updated");
}

export async function setUserActiveAction(
  userId: string,
  isActive: boolean,
): Promise<void> {
  const response = await apiServerFetch(`/api/v1/users/${userId}`, {
    method: "PATCH",
    body: JSON.stringify({ isActive }),
  });
  if (response.status === 401) redirect("/login");
  if (!response.ok) throw new Error(await readApiError(response));
  revalidatePath("/users");
}
