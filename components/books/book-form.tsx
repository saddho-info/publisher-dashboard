"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { BookDetail, FormState } from "@/lib/books/types";

const initialState: FormState = {};

export function BookForm({
  action,
  book,
  publishers,
  showPublisherSelect,
  cancelHref,
  submitLabel,
}: {
  action: (state: FormState, formData: FormData) => Promise<FormState>;
  book?: BookDetail;
  publishers?: Array<{ id: string; name: string }>;
  showPublisherSelect?: boolean;
  cancelHref: string;
  submitLabel: string;
}) {
  const [state, formAction, pending] = useActionState(action, initialState);
  const errors = state.fieldErrors ?? {};

  return (
    <form action={formAction} className="flex max-w-2xl flex-col gap-4">
      {state.error ? (
        <p className="rounded-md border border-destructive/20 bg-destructive/5 px-3 py-2 text-sm text-destructive" role="alert">
          {state.error}
        </p>
      ) : null}

      {showPublisherSelect ? (
        <Select
          name="publisherId"
          label="Publisher"
          required
          defaultValue={book?.publisherId ?? publishers?.[0]?.id ?? ""}
          error={errors.publisherId}
          options={(publishers ?? []).map((publisher) => ({
            value: publisher.id,
            label: publisher.name,
          }))}
        />
      ) : null}

      <Input
        name="title"
        label="Title"
        required
        defaultValue={book?.title}
        error={errors.title}
        maxLength={300}
      />
      <Input
        name="subtitle"
        label="Subtitle"
        defaultValue={book?.subtitle ?? ""}
        error={errors.subtitle}
        maxLength={300}
      />
      <Input
        name="authors"
        label="Authors"
        required
        hint="Comma-separated if there are several."
        defaultValue={book?.authors}
        error={errors.authors}
        maxLength={500}
      />
      <Textarea
        name="description"
        label="Description"
        defaultValue={book?.description ?? ""}
        error={errors.description}
        rows={5}
      />
      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          name="category"
          label="Category"
          defaultValue={book?.category ?? ""}
          error={errors.category}
          maxLength={80}
        />
        <Input
          name="language"
          label="Language"
          hint="ISO code"
          defaultValue={book?.language ?? "en"}
          error={errors.language}
          maxLength={16}
        />
      </div>
      <Input
        name="coverImageUrl"
        label="Cover image URL"
        hint="HTTPS URL. File upload lands later with object storage."
        type="url"
        defaultValue={book?.coverImageUrl ?? ""}
        error={errors.coverImageUrl}
        maxLength={2048}
      />
      <Input
        name="slug"
        label="Slug"
        hint="Leave blank to generate from the title."
        defaultValue={book?.slug ?? ""}
        error={errors.slug}
        maxLength={80}
      />
      <label className="flex items-center gap-2 text-sm font-medium">
        <input
          type="checkbox"
          name="isActive"
          defaultChecked={book?.isActive ?? true}
          className="size-4 rounded border-input"
        />
        Active in catalog
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
