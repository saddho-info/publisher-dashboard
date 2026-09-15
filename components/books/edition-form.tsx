"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { dollarsFromCents, FORMAT_OPTIONS, toDateInputValue } from "@/lib/books/format";
import type { Edition, FormState } from "@/lib/books/types";

const initialState: FormState = {};

export function EditionForm({
  action,
  edition,
  cancelHref,
  submitLabel,
}: {
  action: (state: FormState, formData: FormData) => Promise<FormState>;
  edition?: Edition;
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
        name="isbn"
        label="ISBN-13"
        required
        hint="Hyphens are optional. Check digit is validated."
        defaultValue={edition?.isbn ?? ""}
        error={errors.isbn}
      />
      <Input
        name="isbn10"
        label="ISBN-10"
        defaultValue={edition?.isbn10 ?? ""}
        error={errors.isbn10}
      />
      <Select
        name="format"
        label="Format"
        required
        defaultValue={edition?.format ?? "PAPERBACK"}
        error={errors.format}
        options={FORMAT_OPTIONS}
      />
      <Input
        name="title"
        label="Edition title"
        hint="Only if it differs from the book title."
        defaultValue={edition?.title ?? ""}
        error={errors.title}
      />
      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          name="publicationDate"
          label="Publication date"
          type="date"
          defaultValue={toDateInputValue(edition?.publicationDate ?? null)}
          error={errors.publicationDate}
        />
        <Input
          name="pageCount"
          label="Page count"
          type="number"
          min={1}
          defaultValue={edition?.pageCount ?? ""}
          error={errors.pageCount}
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          name="listPrice"
          label="List price"
          required
          hint="Major units, e.g. 14.99"
          inputMode="decimal"
          defaultValue={
            edition ? dollarsFromCents(edition.listPriceCents) : ""
          }
          error={errors.listPrice}
        />
        <Input
          name="currency"
          label="Currency"
          defaultValue={edition?.currency ?? "USD"}
          maxLength={3}
          error={errors.currency}
        />
      </div>
      <Input
        name="coverImageUrl"
        label="Cover image URL"
        type="url"
        defaultValue={edition?.coverImageUrl ?? ""}
        error={errors.coverImageUrl}
      />
      <label className="flex items-center gap-2 text-sm font-medium">
        <input
          type="checkbox"
          name="isActive"
          defaultChecked={edition?.isActive ?? true}
          className="size-4 rounded border-input"
        />
        Active edition
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
