"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import type { SystemSetting, SystemSettingState } from "@/lib/system-settings";

export function SystemSettingForm({ setting, action }: {
  setting: SystemSetting;
  action: (state: SystemSettingState, data: FormData) => Promise<SystemSettingState>;
}) {
  const [state, formAction, pending] = useActionState(action, {});
  return <form action={formAction} className="rounded-lg border bg-card p-4">
    <div className="mb-3"><h2 className="font-medium">{setting.key}</h2>{setting.description ? <p className="text-sm text-muted-foreground">{setting.description}</p> : null}</div>
    <Textarea name="value" label="JSON value" rows={5} defaultValue={JSON.stringify(setting.value, null, 2)} error={state.error} />
    <div className="mt-3 flex items-center gap-3"><Button type="submit" size="sm" loading={pending}>Save</Button>{state.success ? <p role="status" className="text-sm text-success">{state.success}</p> : null}</div>
  </form>;
}
