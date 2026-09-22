import type { Metadata } from "next";
import { PageHeader } from "@/components/dashboard/page-header";
import { FeatureFlagForm } from "@/components/system/feature-flag-form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { requireSuperAdmin } from "@/lib/auth/roles";
import { addFeatureFlagOverrideAction, deleteFeatureFlagOverrideAction, getFeatureFlag, saveFeatureFlagAction } from "@/lib/feature-flags";

export const metadata: Metadata = { title: "Edit Feature Flag" };

export default async function EditFeatureFlagPage({ params }: { params: Promise<{ flagId: string }> }) {
  await requireSuperAdmin();
  const { flagId } = await params;
  const flag = await getFeatureFlag(flagId);
  return <div className="flex flex-col gap-8">
    <PageHeader title={`Edit ${flag.name}`} description="Update the default and organization-specific behavior." />
    <FeatureFlagForm flag={flag} action={saveFeatureFlagAction.bind(null, flag.id)} />
    <section className="space-y-4"><h2 className="text-sm font-semibold">Add organization override</h2>
      <form action={addFeatureFlagOverrideAction.bind(null, flag.id)} className="grid max-w-3xl gap-3 rounded-lg border bg-card p-4 sm:grid-cols-2">
        <Input name="publisherId" label="Publisher ID" hint="Leave blank for a library override." />
        <Input name="libraryId" label="Library ID" hint="Leave blank for a publisher override." />
        <label className="flex items-center gap-2 text-sm font-medium"><input name="enabled" type="checkbox" className="size-4" />Enabled</label>
        <div><Button type="submit">Add override</Button></div>
      </form>
      {flag.overrides?.length ? <Table><TableHeader><TableRow><TableHead>Scope</TableHead><TableHead>Value</TableHead><TableHead>Action</TableHead></TableRow></TableHeader><TableBody>{flag.overrides.map((override) =>
        <TableRow key={override.id}><TableCell className="font-mono text-xs">{override.publisherId ? `Publisher: ${override.publisherId}` : `Library: ${override.libraryId}`}</TableCell><TableCell><Badge variant={override.enabled ? "success" : "muted"}>{override.enabled ? "Enabled" : "Disabled"}</Badge></TableCell><TableCell><form action={deleteFeatureFlagOverrideAction.bind(null, flag.id, override.id)}><Button type="submit" variant="outline" size="sm">Remove</Button></form></TableCell></TableRow>
      )}</TableBody></Table> : <p className="text-sm text-muted-foreground">No organization overrides.</p>}
    </section>
  </div>;
}
