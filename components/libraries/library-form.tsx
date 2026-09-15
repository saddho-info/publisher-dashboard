"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { FormState, LibraryDetail } from "@/lib/libraries/types";

const initialState: FormState = {};

export function LibraryForm({
  action,
  library,
  publishers,
  showPublisherSelect,
  cancelHref,
  submitLabel,
  showPartnershipNotes,
}: {
  action: (state: FormState, formData: FormData) => Promise<FormState>;
  library?: LibraryDetail;
  publishers?: Array<{ id: string; name: string }>;
  showPublisherSelect?: boolean;
  cancelHref: string;
  submitLabel: string;
  showPartnershipNotes?: boolean;
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

      {showPublisherSelect ? (
        <Select
          name="publisherId"
          label="Publisher"
          required
          defaultValue={library?.link?.publisherId ?? publishers?.[0]?.id ?? ""}
          error={errors.publisherId}
          options={(publishers ?? []).map((publisher) => ({
            value: publisher.id,
            label: publisher.name,
          }))}
        />
      ) : null}

      <Input
        name="name"
        label="Library name"
        required
        defaultValue={library?.name}
        error={errors.name}
        maxLength={200}
      />
      <Input
        name="slug"
        label="Slug"
        hint="Leave blank to generate from the name. Used when another publisher links this library."
        defaultValue={library?.slug ?? ""}
        error={errors.slug}
        maxLength={80}
      />
      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          name="email"
          label="Email"
          type="email"
          defaultValue={library?.email ?? ""}
          error={errors.email}
          maxLength={254}
        />
        <Input
          name="phone"
          label="Phone"
          defaultValue={library?.phone ?? ""}
          error={errors.phone}
          maxLength={40}
        />
      </div>
      <Input
        name="address"
        label="Address"
        defaultValue={library?.address ?? ""}
        error={errors.address}
        maxLength={500}
      />
      {showPartnershipNotes ? (
        <Textarea
          name="notes"
          label="Partnership notes"
          hint="Internal notes for this publisher only."
          defaultValue={library?.link?.notes ?? ""}
          error={errors.notes}
          rows={3}
        />
      ) : null}
      <label className="flex items-center gap-2 text-sm font-medium">
        <input
          type="checkbox"
          name="isActive"
          defaultChecked={library?.isActive ?? true}
          className="size-4 rounded border-input"
        />
        Active library
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
