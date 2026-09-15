import type { Metadata } from "next";
import { OverviewView } from "@/components/overview/overview-view";
import { getOverview } from "@/lib/overview/get-overview";
import { parseOverviewPeriod } from "@/lib/overview/types";

export const metadata: Metadata = {
  title: "Dashboard",
};

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ period?: string }>;
}) {
  const params = await searchParams;
  const period = parseOverviewPeriod(params.period);
  const overview = await getOverview(period);

  return <OverviewView data={overview} />;
}
