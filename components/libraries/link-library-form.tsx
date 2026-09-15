"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { FormState } from "@/lib/libraries/types";

const initialState: FormState = {};

export function LinkLibraryForm({
  action,
  publishers,
  showPublisherSelect,
}: {
  action: (state: FormState, formData: FormData) => Promise<FormState>;
  publishers?: Array<{ id: string; name: string }>;
  showPublisherSelect?: boolean;
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
          defaultValue={publishers?.[0]?.id ?? ""}
          error={errors.publisherId}
          options={(publishers ?? []).map((publisher) => ({
            value: publisher.id,
            label: publisher.name,
          }))}
        />
      ) : null}

      <Input
        name="slug"
        label="Library slug"
        required
        hint="Ask the library for their slug, e.g. harbor-community."
        error={errors.slug}
        maxLength={80}
      />
      <Textarea
        name="notes"
        label="Partnership notes"
        rows={3}
        error={errors.notes}
      />
      <div className="flex gap-2">
        <Button type="submit" loading={pending}>
          Link library
        </Button>
        <Link
          href="/libraries"
          className="inline-flex h-9 items-center rounded-md px-3.5 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}
