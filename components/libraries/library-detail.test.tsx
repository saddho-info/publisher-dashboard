import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";
import { LibraryDetailView } from "@/components/libraries/library-detail";
import type {
  LibraryDetail,
  LibraryPublisherPerformance,
} from "@/lib/libraries/types";
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

describe("LibraryDetailView", () => {
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
