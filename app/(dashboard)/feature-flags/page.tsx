import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/dashboard/page-header";
import { FeatureFlagForm } from "@/components/system/feature-flag-form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { requireSuperAdmin } from "@/lib/auth/roles";
import { deleteFeatureFlagAction, getFeatureFlags, saveFeatureFlagAction } from "@/lib/feature-flags";

export const metadata: Metadata = { title: "Feature Flags" };

export default async function FeatureFlagsPage() {
  await requireSuperAdmin();
  const flags = await getFeatureFlags();
  return <div className="flex flex-col gap-8">
    <PageHeader title="Feature Flags" description="Control platform features globally and for individual organizations." />
    <section className="space-y-4"><h2 className="text-sm font-semibold">Create flag</h2><FeatureFlagForm action={saveFeatureFlagAction.bind(null, null)} /></section>
    <section className="space-y-3"><h2 className="text-sm font-semibold">Configured flags</h2>
      {flags.length ? <Table><TableHeader><TableRow><TableHead>Flag</TableHead><TableHead>Default</TableHead><TableHead>Overrides</TableHead><TableHead>Actions</TableHead></TableRow></TableHeader>
        <TableBody>{flags.map((flag) => <TableRow key={flag.id}><TableCell><p className="font-medium">{flag.name}</p><code className="text-xs text-muted-foreground">{flag.key}</code></TableCell><TableCell><Badge variant={flag.isActive ? "success" : "muted"}>{flag.isActive ? "Enabled" : "Disabled"}</Badge></TableCell><TableCell>{flag.overrides?.length ?? 0}</TableCell><TableCell><div className="flex items-center gap-3"><Link href={`/feature-flags/${flag.id}/edit`} className="text-sm font-medium hover:underline">Edit and configure</Link><form action={deleteFeatureFlagAction.bind(null, flag.id)}><Button type="submit" size="sm" variant="outline">Delete</Button></form></div></TableCell></TableRow>)}</TableBody>
      </Table> : <EmptyState title="No feature flags" description="Create the first flag using the form above." />}
    </section>
  </div>;
}
