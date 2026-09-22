import { redirect } from "next/navigation";
import { apiServerFetch, ApiError, readApiError } from "@/lib/api/server";

export type SystemActivity = {
  id: string;
  action: string;
  actor?: string | null;
  createdAt: string;
};

export type SystemOverview = {
  publishers: number;
  libraries: number;
  users: number;
  activeUsers: number;
  roles: Record<string, number>;
  sales: { count: number; totalCents: number; currency: string };
  inventory: { onHand: number; distributed: number; sold: number };
  recentActivity: SystemActivity[];
};

type SystemOverviewResponse = {
  publishers?: { total?: number; active?: number };
  libraries?: { total?: number; active?: number };
  users?: { total?: number; active?: number; byRole?: Record<string, number> };
  salesLast30Days?: {
    count?: number;
    totalsByCurrency?: Array<{ currency: string; totalCents: number }>;
  };
  inventory?: {
    onHand?: number;
    inTransit?: number;
    sold?: number;
  };
  recentAuditActivity?: Array<{
    id: string;
    action: string;
    createdAt: string;
    actor?: {
      firstName?: string;
      lastName?: string;
      email?: string;
    } | null;
  }>;
};

export async function getSystemOverview(): Promise<SystemOverview> {
  const response = await apiServerFetch("/api/v1/analytics/system-overview");
  if (response.status === 401) redirect("/login");
  if (!response.ok) throw new ApiError(await readApiError(response), response.status);
  const body = (await response.json()) as SystemOverviewResponse;
  const primarySalesTotal = body.salesLast30Days?.totalsByCurrency?.[0];
  return {
    publishers: body.publishers?.total ?? 0,
    libraries: body.libraries?.total ?? 0,
    users: body.users?.total ?? 0,
    activeUsers: body.users?.active ?? 0,
    roles: body.users?.byRole ?? {},
    sales: {
      count: body.salesLast30Days?.count ?? 0,
      totalCents: primarySalesTotal?.totalCents ?? 0,
      currency: primarySalesTotal?.currency ?? "USD",
    },
    inventory: {
      onHand: body.inventory?.onHand ?? 0,
      distributed: body.inventory?.inTransit ?? 0,
      sold: body.inventory?.sold ?? 0,
    },
    recentActivity: (body.recentAuditActivity ?? []).map((item) => {
      const actorName = [item.actor?.firstName, item.actor?.lastName]
        .filter(Boolean)
        .join(" ");
      return {
        id: item.id,
        action: item.action,
        actor: actorName || item.actor?.email || null,
        createdAt: item.createdAt,
      };
    }),
  };
}
