import type { Metadata } from "next";
import { AlertsView, alertsFromOverview } from "@/components/alerts/alerts-view";
import { requirePublisherSession } from "@/lib/auth/session";
import { getAnalyticsOverview } from "@/lib/analytics/get-analytics";

export const metadata: Metadata = {
  title: "Alerts",
};

export default async function AlertsPage() {
  await requirePublisherSession();
  // Point-in-time stock alerts; period does not change low-stock rows.
  const overview = await getAnalyticsOverview("all");
  const alerts = alertsFromOverview(overview);

  return (
    <AlertsView
      lowStock={alerts.lowStock}
      lowStockCount={alerts.lowStockCount}
    />
  );
}
