import type { Metadata } from "next";
import { AnalyticsView } from "@/components/analytics/analytics-view";
import { requirePublisherSession } from "@/lib/auth/session";
import { getAnalyticsOverview } from "@/lib/analytics/get-analytics";
import { parseOverviewPeriod } from "@/lib/overview/types";

export const metadata: Metadata = {
  title: "Analytics",
};

export default async function AnalyticsPage({
  searchParams,
}: {
  searchParams: Promise<{ period?: string }>;
}) {
  await requirePublisherSession();
  const params = await searchParams;
  const period = parseOverviewPeriod(params.period);
  const overview = await getAnalyticsOverview(period);

  return <AnalyticsView data={overview} />;
}
