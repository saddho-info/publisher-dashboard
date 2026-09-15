"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { updateLibraryLinkAction } from "@/lib/libraries/actions";
import type { FormState, LibraryDetail } from "@/lib/libraries/types";

const initialState: FormState = {};

export function PartnershipForm({ library }: { library: LibraryDetail }) {
  const action = updateLibraryLinkAction.bind(null, library.id);
  const [state, formAction, pending] = useActionState(action, initialState);

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
      {library.link?.publisherId ? (
        <input type="hidden" name="publisherId" value={library.link.publisherId} />
      ) : null}
      <Textarea
        name="notes"
        label="Notes"
        defaultValue={library.link?.notes ?? ""}
        rows={3}
      />
      <label className="flex items-center gap-2 text-sm font-medium">
        <input
          type="checkbox"
          name="linkActive"
          defaultChecked={library.link?.isActive ?? true}
          className="size-4 rounded border-input"
        />
        Partnership active
      </label>
      <div>
        <Button type="submit" variant="secondary" size="sm" loading={pending}>
          Save partnership
        </Button>
      </div>
    </form>
  );
}
