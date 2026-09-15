"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { unlinkLibraryAction } from "@/lib/libraries/actions";

export function UnlinkLibraryButton({
  libraryId,
  libraryName,
  publisherId,
}: {
  libraryId: string;
  libraryName: string;
  publisherId?: string;
}) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | undefined>();
  const [pending, setPending] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger className="text-sm font-medium text-destructive hover:underline">
        Remove partnership
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Remove {libraryName}?</DialogTitle>
          <DialogDescription>
            This publisher will no longer see this library. Existing copies at
            the library are unchanged. You can link it again later by slug.
          </DialogDescription>
        </DialogHeader>
        <DialogBody>
          {error ? (
            <p className="text-sm text-destructive" role="alert">
              {error}
            </p>
          ) : null}
        </DialogBody>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <form
            action={async () => {
              setPending(true);
              setError(undefined);
              const result = await unlinkLibraryAction(libraryId, publisherId);
              setPending(false);
              if (result?.error) {
                setError(result.error);
              }
            }}
          >
            <Button type="submit" variant="danger" loading={pending}>
              Remove
            </Button>
          </form>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
