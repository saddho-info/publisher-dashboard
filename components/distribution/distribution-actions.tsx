"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { buttonClassName } from "@/components/ui/button-styles";
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
import {
  cancelDistributionAction,
  dispatchDistributionAction,
} from "@/lib/distribution/actions";

export function DispatchDistributionButton({
  distributionId,
  code,
}: {
  distributionId: string;
  code: string;
}) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | undefined>();
  const [pending, setPending] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger className={buttonClassName()}>Dispatch</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Dispatch {code}?</DialogTitle>
          <DialogDescription>
            Warehouse copies will be marked in transit and assigned to this
            library. Receiving confirmation is a later library-side step.
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
            Back
          </Button>
          <form
            action={async () => {
              setPending(true);
              setError(undefined);
              const result = await dispatchDistributionAction(distributionId);
              setPending(false);
              if (result?.error) {
                setError(result.error);
              }
            }}
          >
            <Button type="submit" loading={pending}>
              Dispatch shipment
            </Button>
          </form>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function CancelDistributionButton({
  distributionId,
  code,
}: {
  distributionId: string;
  code: string;
}) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | undefined>();
  const [pending, setPending] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger className="text-sm font-medium text-destructive hover:underline">
        Cancel draft
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Cancel {code}?</DialogTitle>
          <DialogDescription>
            This draft will not be sent. Warehouse stock is unchanged.
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
            Keep draft
          </Button>
          <form
            action={async () => {
              setPending(true);
              setError(undefined);
              const result = await cancelDistributionAction(distributionId);
              setPending(false);
              if (result?.error) {
                setError(result.error);
              }
            }}
          >
            <Button type="submit" variant="danger" loading={pending}>
              Cancel shipment
            </Button>
          </form>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
