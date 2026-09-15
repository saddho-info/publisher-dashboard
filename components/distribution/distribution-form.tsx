"use client";

import { useActionState, useMemo, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { buttonClassName } from "@/components/ui/button-styles";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { createDistributionAction } from "@/lib/distribution/actions";
import type { FormState } from "@/lib/distribution/types";
import { formatBookFormat, formatIsbn13 } from "@/lib/books/format";
import type { InventoryRollup } from "@/lib/inventory/types";
import type { LibraryListItem } from "@/lib/libraries/types";

const initialState: FormState = {};

type Line = { key: string; editionId: string; quantity: number };

function newLine(editionId = "", quantity = 1, key?: string): Line {
  return { key: key ?? `line-${editionId || "new"}-${quantity}`, editionId, quantity };
}

export function DistributionForm({
  libraries,
  editions,
  publishers,
  showPublisherSelect,
  defaultLibraryId,
  defaultEditionId,
}: {
  libraries: LibraryListItem[];
  editions: InventoryRollup[];
  publishers: Array<{ id: string; name: string }>;
  showPublisherSelect: boolean;
  defaultLibraryId?: string;
  defaultEditionId?: string;
}) {
  const [state, formAction, pending] = useActionState(
    createDistributionAction,
    initialState,
  );
  const [lines, setLines] = useState<Line[]>([
    newLine(defaultEditionId ?? "", 1, "line-0"),
  ]);
  const errors = state.fieldErrors ?? {};

  const editionOptions = useMemo(
    () =>
      editions.map((row) => ({
        value: row.editionId,
        label: `${row.book.title} · ${formatBookFormat(row.format)} · ${formatIsbn13(row.isbn)} (${row.warehouseOnHand} in warehouse)`,
        warehouseOnHand: row.warehouseOnHand,
      })),
    [editions],
  );

  const payload = JSON.stringify(
    lines.map((line) => ({
      editionId: line.editionId,
      quantity: line.quantity,
    })),
  );

  return (
    <form action={formAction} className="flex flex-col gap-6">
      {state.error ? (
        <p
          className="rounded-md border border-destructive/20 bg-destructive/5 px-3 py-2 text-sm text-destructive"
          role="alert"
        >
          {state.error}
        </p>
      ) : null}

      <input type="hidden" name="items" value={payload} />

      {showPublisherSelect ? (
        <Select
          name="publisherId"
          label="Publisher"
          required
          placeholder="Select publisher"
          defaultValue=""
          error={errors.publisherId}
          options={publishers.map((publisher) => ({
            value: publisher.id,
            label: publisher.name,
          }))}
        />
      ) : null}

      <Select
        name="libraryId"
        label="Library"
        required
        placeholder="Select a partner library"
        defaultValue={defaultLibraryId ?? ""}
        error={errors.libraryId}
        options={libraries.map((library) => ({
          value: library.id,
          label: library.name,
          disabled: !library.isActive || library.link?.isActive === false,
        }))}
        hint="Only linked, active partnerships can receive stock."
      />

      <fieldset className="flex flex-col gap-3">
        <legend className="text-sm font-medium text-foreground">
          Editions
        </legend>
        {errors.items ? (
          <p className="text-xs text-destructive" role="alert">
            {errors.items}
          </p>
        ) : (
          <p className="text-xs text-muted-foreground">
            Copies are picked from warehouse stock (lowest copy number first)
            when you dispatch.
          </p>
        )}
        {lines.map((line, index) => {
          const selected = editionOptions.find(
            (option) => option.value === line.editionId,
          );
          return (
            <div
              key={line.key}
              className="grid gap-2 rounded-lg border border-border p-3 sm:grid-cols-[minmax(0,1fr)_8rem_auto] sm:items-end"
            >
              <Select
                label={index === 0 ? "Edition" : undefined}
                value={line.editionId}
                onChange={(event) => {
                  const editionId = event.target.value;
                  setLines((current) =>
                    current.map((row) =>
                      row.key === line.key ? { ...row, editionId } : row,
                    ),
                  );
                }}
                placeholder="Select edition"
                options={editionOptions.map((option) => ({
                  value: option.value,
                  label: option.label,
                  disabled: lines.some(
                    (other) =>
                      other.key !== line.key && other.editionId === option.value,
                  ),
                }))}
              />
              <Input
                label={index === 0 ? "Quantity" : undefined}
                type="number"
                min={1}
                max={selected?.warehouseOnHand || 1000}
                value={line.quantity}
                onChange={(event) => {
                  const quantity = Number(event.target.value);
                  setLines((current) =>
                    current.map((row) =>
                      row.key === line.key ? { ...row, quantity } : row,
                    ),
                  );
                }}
                hint={
                  selected
                    ? `${selected.warehouseOnHand} available`
                    : undefined
                }
              />
              {lines.length > 1 ? (
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() =>
                    setLines((current) =>
                      current.filter((row) => row.key !== line.key),
                    )
                  }
                >
                  Remove
                </Button>
              ) : (
                <span />
              )}
            </div>
          );
        })}
        <Button
          type="button"
          variant="outline"
          onClick={() =>
            setLines((current) => [
              ...current,
              newLine("", 1, `line-${current.length}-${Date.now()}`),
            ])
          }
          disabled={lines.length >= editionOptions.length}
        >
          Add edition
        </Button>
      </fieldset>

      <Textarea
        name="notes"
        label="Notes"
        rows={3}
        maxLength={1000}
        placeholder="Optional packing or routing notes"
      />

      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          name="dispatchNow"
          className="size-4 rounded border-input"
        />
        Dispatch immediately (move copies in transit)
      </label>

      <div className="flex flex-wrap gap-2">
        <Button type="submit" loading={pending}>
          Create shipment
        </Button>
        <Link href="/distribution" className={buttonClassName({ variant: "outline" })}>
          Cancel
        </Link>
      </div>
    </form>
  );
}
