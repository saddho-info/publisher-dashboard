"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { FormState, PublisherDetail } from "@/lib/publishers/types";

const initialState: FormState = {};

export function PublisherForm({
  action,
  publisher,
  cancelHref,
  submitLabel,
}: {
  action: (state: FormState, formData: FormData) => Promise<FormState>;
  publisher?: PublisherDetail;
  cancelHref: string;
  submitLabel: string;
}) {
  const [state, formAction, pending] = useActionState(action, initialState);
  const errors = state.fieldErrors ?? {};

  return (
    <form action={formAction} className="flex max-w-2xl flex-col gap-4">
      {state.error ? (
        <p
          className="rounded-md border border-destructive/20 bg-destructive/5 px-3 py-2 text-sm text-destructive"
          role="alert"
        >
          {state.error}
        </p>
      ) : null}

      <Input
        name="name"
        label="Publisher name"
        required
        defaultValue={publisher?.name}
        error={errors.name}
        maxLength={200}
      />
      <Input
        name="slug"
        label="Slug"
        hint="Leave blank to generate from the name."
        defaultValue={publisher?.slug ?? ""}
        error={errors.slug}
        maxLength={80}
      />
      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          name="email"
          label="Email"
          type="email"
          defaultValue={publisher?.email ?? ""}
          error={errors.email}
          maxLength={254}
        />
        <Input
          name="phone"
          label="Phone"
          defaultValue={publisher?.phone ?? ""}
          error={errors.phone}
          maxLength={40}
        />
      </div>
      <Input
        name="address"
        label="Address"
        defaultValue={publisher?.address ?? ""}
        error={errors.address}
        maxLength={500}
      />
      <label className="flex items-center gap-2 text-sm font-medium">
        <input
          type="checkbox"
          name="isActive"
          defaultChecked={publisher?.isActive ?? true}
          className="size-4 rounded border-input"
        />
        Active publisher
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
