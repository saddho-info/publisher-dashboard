import type { Metadata } from "next";
import { PageHeader } from "@/components/dashboard/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { requireSuperAdmin } from "@/lib/auth/roles";
import { getSystemOverview } from "@/lib/system/get-system-overview";

export const metadata: Metadata = { title: "System Overview" };
const number = new Intl.NumberFormat("en");

export default async function SystemPage() {
  await requireSuperAdmin();
  const overview = await getSystemOverview();
  const metrics = [
    ["Publishers", overview.publishers],
    ["Libraries", overview.libraries],
    ["Users", overview.users],
    ["Active users", overview.activeUsers],
  ] as const;
  return <div className="flex flex-col gap-6">
    <PageHeader title="System Overview" description="A platform-wide view of organizations, access, inventory, and sales." />
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{metrics.map(([label, value]) =>
      <Card key={label}><CardHeader><CardTitle className="text-sm text-muted-foreground">{label}</CardTitle></CardHeader><CardContent className="text-2xl font-semibold tabular-nums">{number.format(value)}</CardContent></Card>
    )}</div>
    <div className="grid gap-4 lg:grid-cols-3">
      <Card><CardHeader><CardTitle>Users by role</CardTitle></CardHeader><CardContent className="space-y-2">{Object.entries(overview.roles).length ? Object.entries(overview.roles).map(([role, count]) =>
        <div key={role} className="flex justify-between text-sm"><span>{role.replaceAll("_", " ")}</span><strong>{number.format(count)}</strong></div>
      ) : <p className="text-sm text-muted-foreground">No role data available.</p>}</CardContent></Card>
      <Card><CardHeader><CardTitle>Sales</CardTitle></CardHeader><CardContent className="space-y-2"><p className="text-2xl font-semibold">{number.format(overview.sales.count)}</p><p className="text-sm text-muted-foreground">{new Intl.NumberFormat("en", { style: "currency", currency: overview.sales.currency }).format(overview.sales.totalCents / 100)} confirmed revenue</p></CardContent></Card>
      <Card><CardHeader><CardTitle>Inventory</CardTitle></CardHeader><CardContent className="space-y-2 text-sm"><p>On hand <strong className="float-right">{number.format(overview.inventory.onHand)}</strong></p><p>Distributed <strong className="float-right">{number.format(overview.inventory.distributed)}</strong></p><p>Sold <strong className="float-right">{number.format(overview.inventory.sold)}</strong></p></CardContent></Card>
    </div>
    <section className="space-y-3"><h2 className="text-sm font-semibold">Recent activity</h2>
      {overview.recentActivity.length ? <Table><TableHeader><TableRow><TableHead>Action</TableHead><TableHead>Actor</TableHead><TableHead>When</TableHead></TableRow></TableHeader><TableBody>{overview.recentActivity.map((item) =>
        <TableRow key={item.id}><TableCell>{item.action}</TableCell><TableCell>{item.actor ?? "System"}</TableCell><TableCell>{new Date(item.createdAt).toLocaleString()}</TableCell></TableRow>
      )}</TableBody></Table> : <EmptyState title="No recent activity" description="Platform activity will appear here as organizations and users work in PubTrack." />}
    </section>
  </div>;
}
