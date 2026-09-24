import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { LibraryDetailView } from "@/components/libraries/library-detail";
import type {
  LibraryDetail,
  LibraryEditionPerformance,
  LibraryPublisherPerformance,
} from "@/lib/libraries/types";
import type { DistributionListItem } from "@/lib/distribution/types";
import type { LibraryUser } from "@/lib/users/types";

vi.mock("next/link", () => ({
  default: ({ children, href }: { children: ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh }),
}));

vi.mock("@/components/libraries/partnership-form", () => ({
  PartnershipForm: () => <div>Partnership form</div>,
}));

vi.mock("@/components/libraries/unlink-library-button", () => ({
  UnlinkLibraryButton: () => <button type="button">Unlink</button>,
}));

const refresh = vi.fn();

const library: LibraryDetail = {
  id: "lib_riverside",
  name: "Riverside Public Library",
  slug: "riverside-public-library",
  email: "hello@riverside.example",
  phone: null,
  address: "10 River Road",
  isActive: true,
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-02T00:00:00.000Z",
  _count: { users: 3 },
  link: {
    id: "link_1",
    publisherId: "pub_1",
    isActive: true,
    notes: null,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-02T00:00:00.000Z",
  },
  stock: {
    onHand: 99,
    inTransit: 88,
    sold: 77,
    returned: 0,
    lost: 0,
    copyCount: 264,
  },
};

const performance: LibraryPublisherPerformance = {
  library: {
    id: "lib_riverside",
    name: "Riverside Public Library",
    slug: "riverside-public-library",
  },
  summary: {
    totalDistributed: 20,
    inStock: 11,
    inTransit: 2,
    sold: 7,
    revenueByCurrency: [
      { currency: "USD", totalCents: 10500 },
      { currency: "EUR", totalCents: 4500 },
    ],
  },
};

const portalUser: LibraryUser = {
  id: "user_la",
  email: "admin@riverside.example",
  firstName: "River",
  lastName: "Admin",
  role: "LIBRARY_ADMIN",
  isActive: true,
  publisherId: null,
  libraryId: "lib_riverside",
  createdAt: "2026-01-01",
  updatedAt: "2026-01-01",
};

const editionPerformance: LibraryEditionPerformance = {
  library: performance.library,
  summary: performance.summary,
  editions: [
    {
      book: {
        id: "book_silent",
        title: "The Silent Archive",
        authors: "Author Name",
        publisherId: "pub_1",
      },
      edition: {
        id: "ed_hardcover",
        bookId: "book_silent",
        title: null,
        format: "HARDCOVER",
        isbn: "9781234567890",
        isbn10: null,
        listPriceCents: 2000,
        currency: "USD",
      },
      totalDistributed: 12,
      inStock: 7,
      inTransit: 1,
      sold: 4,
      revenueByCurrency: [{ currency: "USD", totalCents: 6000 }],
    },
    {
      book: {
        id: "book_river",
        title: "River Stories",
        authors: "Another Author",
        publisherId: "pub_1",
      },
      edition: {
        id: "ed_paperback",
        bookId: "book_river",
        title: "Reader edition",
        format: "PAPERBACK",
        isbn: "9781234567891",
        isbn10: null,
        listPriceCents: 1500,
        currency: "USD",
      },
      totalDistributed: 8,
      inStock: 11,
      inTransit: 0,
      sold: 2,
      revenueByCurrency: [],
    },
  ],
};

const shipment: DistributionListItem = {
  id: "dist_latest",
  publisherId: "pub_1",
  libraryId: "lib_riverside",
  status: "DISPATCHED",
  code: "DST-001",
  notes: null,
  actorUserId: "user_1",
  dispatchedAt: "2026-03-15T10:00:00.000Z",
  cancelledAt: null,
  createdAt: "2026-03-14T00:00:00.000Z",
  updatedAt: "2026-03-15T10:00:00.000Z",
  totalQuantity: 20,
  itemCount: 2,
  publisher: { id: "pub_1", name: "Northwind Press", slug: "northwind-press" },
  library: {
    id: "lib_riverside",
    name: "Riverside Public Library",
    slug: "riverside-public-library",
  },
  actor: {
    id: "user_1",
    firstName: "Pat",
    lastName: "Publisher",
    email: "pat@example.com",
  },
  items: [],
};

describe("LibraryDetailView", () => {
  beforeEach(() => {
    refresh.mockClear();
  });
  it("renders publisher-only performance returned by the endpoint", () => {
    render(
      <LibraryDetailView
        library={library}
        performance={performance}
        role="PUBLISHER_STAFF"
      />,
    );

    const totals = screen.getByRole("region", {
      name: "Publisher performance at this library",
    });
    for (const [label, value] of [
      ["Total distributed", "20"],
      ["In stock", "11"],
      ["In transit", "2"],
      ["Sold", "7"],
    ] as const) {
      const card = within(totals).getByText(label).closest("div");
      expect(within(card as HTMLElement).getByText(value)).toBeVisible();
    }

    expect(within(totals).getByText("$105.00")).toBeVisible();
    expect(within(totals).getByText("€45.00")).toBeVisible();
    expect(within(totals).queryByText("99")).not.toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "View sales for this library" }),
    ).toHaveAttribute("href", "/sales?libraryId=lib_riverside");
  });

  it("keeps the existing stock summary for users without publisher scope", () => {
    render(
      <LibraryDetailView
        library={library}
        performance={null}
        role="SUPER_ADMIN"
      />,
    );

    const stock = screen.getByRole("region", {
      name: "Stock at this library",
    });
    expect(within(stock).getByText("99")).toBeVisible();
    expect(screen.queryByText("Publisher performance")).not.toBeInTheDocument();
  });

  it("shows an empty revenue value when no finalized sales exist", () => {
    render(
      <LibraryDetailView
        library={library}
        performance={{
          ...performance,
          summary: { ...performance.summary, revenueByCurrency: [] },
        }}
        role="PUBLISHER_STAFF"
      />,
    );

    const revenueCard = screen.getByText("Revenue").closest("div");
    expect(within(revenueCard as HTMLElement).getByText("—")).toBeVisible();
  });

  it("keeps library details visible when performance fails and allows retry", async () => {
    const user = userEvent.setup();
    render(
      <LibraryDetailView
        library={library}
        performance={null}
        performanceError="Performance service is unavailable."
        role="PUBLISHER_STAFF"
      />,
    );

    expect(screen.getByRole("alert")).toHaveTextContent(
      "Performance service is unavailable.",
    );
    expect(screen.getAllByText("hello@riverside.example")).toHaveLength(2);
    expect(
      screen.queryByRole("region", { name: "Stock at this library" }),
    ).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Try again" }));
    expect(refresh).toHaveBeenCalledOnce();
  });

  it("renders books at this library sorted by in stock then sold", () => {
    render(
      <LibraryDetailView
        library={library}
        performance={performance}
        editionPerformance={editionPerformance}
        role="PUBLISHER_STAFF"
      />,
    );

    const books = screen.getByRole("region", { name: "Books at this library" });
    const table = within(books).getByRole("table");
    const rows = within(table).getAllByRole("row").slice(1);
    expect(rows).toHaveLength(2);
    expect(
      within(rows[0]).getByRole("link", { name: "River Stories" }),
    ).toHaveAttribute("href", "/books/book_river");
    expect(within(rows[0]).getByText("11")).toBeVisible();
    expect(within(rows[0]).getByText("—")).toBeVisible();
    expect(
      within(rows[1]).getByRole("link", { name: "The Silent Archive" }),
    ).toHaveAttribute("href", "/books/book_silent");
    expect(within(rows[1]).getByText("$60.00")).toBeVisible();
    expect(within(rows[1]).getByText(/Hardcover/)).toBeVisible();
  });

  it("shows an empty books state with the existing distribute CTA", () => {
    render(
      <LibraryDetailView
        library={library}
        performance={performance}
        editionPerformance={{ ...editionPerformance, editions: [] }}
        role="PUBLISHER_STAFF"
      />,
    );

    const books = screen.getByRole("region", { name: "Books at this library" });
    expect(within(books).getByText("No copies at this library yet")).toBeVisible();
    expect(
      within(books).getByRole("link", { name: "Distribute stock" }),
    ).toHaveAttribute("href", "/distribution/new?libraryId=lib_riverside");
  });

  it("keeps library details visible when books fail to load and allows retry", async () => {
    const user = userEvent.setup();
    render(
      <LibraryDetailView
        library={library}
        performance={performance}
        editionPerformance={null}
        editionPerformanceError="Edition report is unavailable."
        role="PUBLISHER_STAFF"
      />,
    );

    const alerts = screen.getAllByRole("alert");
    expect(alerts.some((alert) => alert.textContent?.includes("Edition report is unavailable."))).toBe(
      true,
    );
    expect(screen.getByText("Publisher performance")).toBeVisible();
    expect(screen.getAllByText("hello@riverside.example")).toHaveLength(2);

    await user.click(screen.getByRole("button", { name: "Try again" }));
    expect(refresh).toHaveBeenCalledOnce();
  });

  it("lists recent shipments with links into Distribution", () => {
    render(
      <LibraryDetailView
        library={library}
        performance={performance}
        editionPerformance={editionPerformance}
        shipments={[shipment]}
        shipmentsTotal={12}
        role="PUBLISHER_STAFF"
      />,
    );

    const shipments = screen.getByRole("region", {
      name: "Shipments to this library",
    });
    expect(
      within(shipments).getByRole("link", { name: "DST-001" }),
    ).toHaveAttribute("href", "/distribution/dist_latest");
    expect(within(shipments).getByText("20")).toBeVisible();
    expect(within(shipments).getByText("Dispatched")).toBeVisible();
    expect(
      within(shipments).getByRole("link", { name: "View all" }),
    ).toHaveAttribute("href", "/distribution?libraryId=lib_riverside");
    expect(within(shipments).getByText("Showing 1 of 12 shipments.")).toBeVisible();
  });

  it("shows an empty shipments note when none exist", () => {
    render(
      <LibraryDetailView
        library={library}
        performance={performance}
        role="PUBLISHER_STAFF"
      />,
    );

    expect(screen.getByText("No shipments to this library yet.")).toBeVisible();
  });
});

describe("LibraryDetailView portal access", () => {
  it("shows portal access for SUPER_ADMIN", () => {
    render(
      <LibraryDetailView
        library={library}
        performance={null}
        role="SUPER_ADMIN"
        portalUsers={[portalUser]}
      />,
    );

    expect(screen.getByText("Portal access")).toBeInTheDocument();
    expect(
      screen.getAllByRole("link", { name: "Add portal account" }).length,
    ).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("River Admin")).toBeInTheDocument();
    expect(
      screen.queryByRole("region", { name: "Books at this library" }),
    ).not.toBeInTheDocument();
  });

  it("hides portal access for PUBLISHER_ADMIN", () => {
    render(
      <LibraryDetailView
        library={library}
        performance={null}
        role="PUBLISHER_ADMIN"
        portalUsers={[portalUser]}
      />,
    );

    expect(screen.queryByText("Portal access")).not.toBeInTheDocument();
    expect(
      screen.queryAllByRole("link", { name: "Add portal account" }),
    ).toHaveLength(0);
  });
});
