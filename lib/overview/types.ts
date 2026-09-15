export const OVERVIEW_PERIODS = ["7d", "30d", "90d", "all"] as const;

export type OverviewPeriod = (typeof OVERVIEW_PERIODS)[number];

export const DEFAULT_OVERVIEW_PERIOD: OverviewPeriod = "30d";

export type OverviewActivityType =
  | "SALE"
  | "DISTRIBUTION"
  | "RECEIPT"
  | "ADJUSTMENT"
  | "RETURN";

export type OverviewKpis = {
  totalInventory: number;
  distributed: number;
  sold: number;
  warehouse: number;
  lowStockCount: number;
};

export type OverviewLibraryRank = {
  libraryId: string;
  name: string;
  sold: number;
};

export type OverviewLowStockItem = {
  editionId: string;
  bookTitle: string;
  editionLabel: string;
  onHand: number;
  threshold: number;
};

export type OverviewTopBook = {
  editionId: string;
  bookTitle: string;
  editionLabel: string;
  sold: number;
};

export type OverviewActivityItem = {
  id: string;
  type: OverviewActivityType;
  title: string;
  detail: string;
  occurredAt: string;
};

export type OverviewSnapshot = {
  publisherId: string | null;
  source: "stub" | "live";
  generatedAt: string;
  period: {
    key: OverviewPeriod;
    from: string | null;
    to: string;
  };
  kpis: OverviewKpis;
  libraries: OverviewLibraryRank[];
  lowStock: OverviewLowStockItem[];
  topBooks: OverviewTopBook[];
  activity: OverviewActivityItem[];
};

export function isOverviewPeriod(value: unknown): value is OverviewPeriod {
  return (
    typeof value === "string" &&
    (OVERVIEW_PERIODS as readonly string[]).includes(value)
  );
}

export function parseOverviewPeriod(value: unknown): OverviewPeriod {
  return isOverviewPeriod(value) ? value : DEFAULT_OVERVIEW_PERIOD;
}
