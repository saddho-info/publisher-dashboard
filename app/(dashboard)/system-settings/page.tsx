import type { Metadata } from "next";
import { PageHeader } from "@/components/dashboard/page-header";
import { SystemSettingForm } from "@/components/system/system-setting-form";
import { EmptyState } from "@/components/ui/empty-state";
import { requireSuperAdmin } from "@/lib/auth/roles";
import { getSystemSettings, updateSystemSettingAction } from "@/lib/system-settings";

export const metadata: Metadata = { title: "System Settings" };

export default async function SystemSettingsPage() {
  await requireSuperAdmin();
  const settings = await getSystemSettings();
  return <div className="flex flex-col gap-6">
    <PageHeader title="System Settings" description="Edit JSON-valued platform configuration. Changes apply system-wide." />
    {settings.length ? <div className="grid gap-4 xl:grid-cols-2">{settings.map((setting) =>
      <SystemSettingForm key={setting.id} setting={setting} action={updateSystemSettingAction.bind(null, setting.key)} />
    )}</div> : <EmptyState title="No system settings" description="Settings provided by the backend will appear here." />}
  </div>;
}
