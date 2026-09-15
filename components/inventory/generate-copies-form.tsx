"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  generateCopiesAction,
  updateThresholdAction,
} from "@/lib/inventory/actions";
import type { FormState } from "@/lib/inventory/types";

const initialState: FormState = {};

export function GenerateCopiesForm({ editionId }: { editionId: string }) {
  const action = generateCopiesAction.bind(null, editionId);
  const [state, formAction, pending] = useActionState(action, initialState);
  const errors = state.fieldErrors ?? {};

  return (
    <form action={formAction} className="flex flex-col gap-3">
      {state.error ? (
        <p
          className="rounded-md border border-destructive/20 bg-destructive/5 px-3 py-2 text-sm text-destructive"
          role="alert"
        >
          {state.error}
        </p>
      ) : null}
      <Input
        name="quantity"
        label="Copies to print"
        type="number"
        min={1}
        max={1000}
        required
        defaultValue={10}
        error={errors.quantity}
        hint="Creates unit records and opaque QR tokens in the warehouse. Max 1,000 per run."
      />
      <Input
        name="reason"
        label="Reason"
        placeholder="Spring 2026 hardcover print run"
        maxLength={500}
      />
      <Button type="submit" loading={pending}>
        Generate copies
      </Button>
    </form>
  );
}

export function ThresholdForm({
  editionId,
  current,
}: {
  editionId: string;
  current: number;
}) {
  const action = updateThresholdAction.bind(null, editionId);
  const [state, formAction, pending] = useActionState(action, initialState);
  const errors = state.fieldErrors ?? {};

  return (
    <form action={formAction} className="flex flex-col gap-3 sm:flex-row sm:items-end">
      {state.error ? (
        <p className="text-sm text-destructive" role="alert">
          {state.error}
        </p>
      ) : null}
      <Input
        name="lowStockThreshold"
        label="Low-stock threshold"
        type="number"
        min={0}
        required
        defaultValue={current}
        error={errors.lowStockThreshold}
        className="sm:w-40"
      />
      <Button type="submit" variant="secondary" loading={pending}>
        Save
      </Button>
    </form>
  );
}
