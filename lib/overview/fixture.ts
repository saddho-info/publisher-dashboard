import type { OverviewSnapshot } from "@/lib/overview/types";

/** Sample snapshot for the design-system gallery. Not used by the live dashboard. */
export const OVERVIEW_FIXTURE: OverviewSnapshot = {
  publisherId: "pub_fixture",
  source: "live",
  generatedAt: "2026-08-13T16:40:00.000Z",
  period: {
    key: "30d",
    from: "2026-07-14T16:40:00.000Z",
    to: "2026-08-13T16:40:00.000Z",
  },
  kpis: {
    totalInventory: 12480,
    distributed: 3860,
    sold: 942,
    warehouse: 8620,
    lowStockCount: 3,
  },
  libraries: [
    { libraryId: "lib_north", name: "Northside Public", sold: 312 },
    { libraryId: "lib_river", name: "Riverside Branch", sold: 241 },
    { libraryId: "lib_campus", name: "Campus Store", sold: 188 },
    { libraryId: "lib_east", name: "Eastside Independent", sold: 121 },
    { libraryId: "lib_harbor", name: "Harbor Reading Room", sold: 80 },
  ],
  lowStock: [
    {
      editionId: "ed_river_pb",
      bookTitle: "River of Ink",
      editionLabel: "Paperback · 2026",
      onHand: 8,
      threshold: 25,
    },
    {
      editionId: "ed_paper_hb",
      bookTitle: "Paper Cities",
      editionLabel: "Hardcover · 2025",
      onHand: 4,
      threshold: 20,
    },
    {
      editionId: "ed_quiet_pb",
      bookTitle: "The Quiet Ledger",
      editionLabel: "Paperback · 2026",
      onHand: 12,
      threshold: 30,
    },
  ],
  topBooks: [
    {
      editionId: "ed_silent_hb",
      bookTitle: "The Silent Archive",
      editionLabel: "Hardcover · 2026",
      sold: 286,
    },
    {
      editionId: "ed_river_pb",
      bookTitle: "River of Ink",
      editionLabel: "Paperback · 2026",
      sold: 214,
    },
    {
      editionId: "ed_paper_hb",
      bookTitle: "Paper Cities",
      editionLabel: "Hardcover · 2025",
      sold: 167,
    },
    {
      editionId: "ed_harbor_pb",
      bookTitle: "Harbor Lights",
      editionLabel: "Paperback · 2024",
      sold: 129,
    },
    {
      editionId: "ed_quiet_pb",
      bookTitle: "The Quiet Ledger",
      editionLabel: "Paperback · 2026",
      sold: 88,
    },
  ],
  activity: [
    {
      id: "evt_1",
      type: "SALE",
      title: "Sale confirmed",
      detail: "The Silent Archive · Northside Public",
      occurredAt: "2026-08-13T16:12:00.000Z",
    },
    {
      id: "evt_2",
      type: "DISTRIBUTION",
      title: "Shipment dispatched",
      detail: "40 copies to Riverside Branch",
      occurredAt: "2026-08-13T14:05:00.000Z",
    },
    {
      id: "evt_3",
      type: "RECEIPT",
      title: "Stock received",
      detail: "Campus Store confirmed 24 of 24 copies",
      occurredAt: "2026-08-12T19:40:00.000Z",
    },
    {
      id: "evt_4",
      type: "SALE",
      title: "Sale confirmed",
      detail: "River of Ink · Eastside Independent",
      occurredAt: "2026-08-12T11:18:00.000Z",
    },
    {
      id: "evt_5",
      type: "ADJUSTMENT",
      title: "Warehouse adjustment",
      detail: "Paper Cities hardcover −2 (damaged)",
      occurredAt: "2026-08-11T09:02:00.000Z",
    },
  ],
};
