"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import type { FormState, LibraryUser } from "@/lib/users/types";

const initialState: FormState = {};

export function LibraryPortalUserForm({
  action,
  user,
  cancelHref,
  submitLabel,
  defaultRole = "LIBRARY_ADMIN",
}: {
  action: (state: FormState, formData: FormData) => Promise<FormState>;
  user?: LibraryUser;
  cancelHref: string;
  submitLabel: string;
  defaultRole?: "LIBRARY_ADMIN" | "LIBRARY_STAFF";
}) {
  const [state, formAction, pending] = useActionState(action, initialState);
  const errors = state.fieldErrors ?? {};
  const isEdit = Boolean(user);

  return (
    <form action={formAction} className="flex max-w-xl flex-col gap-4">
      {state.error ? (
        <p
          className="rounded-md border border-destructive/20 bg-destructive/5 px-3 py-2 text-sm text-destructive"
          role="alert"
        >
          {state.error}
        </p>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          name="firstName"
          label="First name"
          required
          defaultValue={user?.firstName}
          error={errors.firstName}
          maxLength={80}
        />
        <Input
          name="lastName"
          label="Last name"
          required
          defaultValue={user?.lastName}
          error={errors.lastName}
          maxLength={80}
        />
      </div>
      <Input
        name="email"
        type="email"
        label="Email"
        required
        defaultValue={user?.email}
        error={errors.email}
        maxLength={254}
      />
      <Input
        name="password"
        type="password"
        label={isEdit ? "New temporary password" : "Temporary password"}
        hint={
          isEdit
            ? "Leave blank to keep the current password. At least 8 characters if set."
            : "At least 8 characters. Share this with the library contact out of band."
        }
        required={!isEdit}
        minLength={8}
        error={errors.password}
        autoComplete="new-password"
      />
      <Select
        name="role"
        label="Role"
        defaultValue={user?.role ?? defaultRole}
        options={[
          { value: "LIBRARY_ADMIN", label: "Library admin" },
          { value: "LIBRARY_STAFF", label: "Library staff" },
        ]}
      />
      <label className="flex items-center gap-2 text-sm font-medium">
        <input
          type="checkbox"
          name="isActive"
          defaultChecked={user?.isActive ?? true}
          className="size-4 rounded border-input"
        />
        Active portal account
      </label>
      <div className="flex gap-2">
        <Button type="submit" loading={pending}>
          {submitLabel}
        </Button>
        <Link
          href={cancelHref}
          className="inline-flex h-9 items-center rounded-md px-3.5 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}
