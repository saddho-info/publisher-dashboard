"use client";

import Link from "next/link";
import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { FeatureFlag, FeatureFlagState } from "@/lib/feature-flags";

export function FeatureFlagForm({ action, flag }: {
  action: (state: FeatureFlagState, data: FormData) => Promise<FeatureFlagState>;
  flag?: FeatureFlag;
}) {
  const [state, formAction, pending] = useActionState(action, {});
  return <form action={formAction} className="flex max-w-2xl flex-col gap-4">
    {state.error ? <p role="alert" className="rounded-md border border-destructive/20 bg-destructive/5 p-3 text-sm text-destructive">{state.error}</p> : null}
    <Input name="key" label="Key" required defaultValue={flag?.key} error={state.fieldErrors?.key} placeholder="new_checkout" />
    <Input name="name" label="Name" required defaultValue={flag?.name} error={state.fieldErrors?.name} />
    <Textarea name="description" label="Description" defaultValue={flag?.description ?? ""} />
    <label className="flex items-center gap-2 text-sm font-medium"><input name="enabled" type="checkbox" defaultChecked={flag?.isActive ?? true} className="size-4" />Enabled by default</label>
    <div className="flex gap-2"><Button type="submit" loading={pending}>{flag ? "Save flag" : "Create flag"}</Button>{flag ? <Link href="/feature-flags" className="px-3 py-2 text-sm text-muted-foreground">Cancel</Link> : null}</div>
  </form>;
}
