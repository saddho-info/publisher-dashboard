import { render, screen, within } from "@testing-library/react";
import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";
import { LibrariesTable } from "@/components/libraries/libraries-table";
import type { LibraryListItem } from "@/lib/libraries/types";

vi.mock("next/link", () => ({
  default: ({ children, href }: { children: ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

const library: LibraryListItem = {
  id: "lib_riverside",
  name: "Riverside Public Library",
  slug: "riverside-public-library",
  email: "hello@riverside.example",
  phone: null,
  address: null,
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
    onHand: 11,
    inTransit: 2,
    sold: 7,
    returned: 0,
    lost: 0,
    copyCount: 20,
  },
  lastDispatchedAt: "2026-03-15T10:00:00.000Z",
  lastDistributionId: "dist_latest",
  totalDistributed: 20,
  revenueByCurrency: [
    { currency: "BDT", totalCents: 1500000 },
    { currency: "USD", totalCents: 2500 },
  ],
};

describe("LibrariesTable", () => {
  it("shows ledger columns for each library row", () => {
    render(<LibrariesTable libraries={[library]} />);

    expect(
      screen.getByRole("columnheader", { name: "Last sent" }),
    ).toBeVisible();
    expect(
      screen.getByRole("columnheader", { name: "Distributed" }),
    ).toBeVisible();
    expect(
      screen.getByRole("columnheader", { name: "In stock" }),
    ).toBeVisible();
    expect(screen.getByRole("columnheader", { name: "Sold" })).toBeVisible();
    expect(screen.getByRole("columnheader", { name: "Sales" })).toBeVisible();
    expect(
      screen.queryByRole("columnheader", { name: "Contact" }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("columnheader", { name: "Staff" }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("columnheader", { name: "On hand" }),
    ).not.toBeInTheDocument();
  });

  it("links the library name and last shipment to existing detail routes", () => {
    render(<LibrariesTable libraries={[library]} />);

    const table = screen.getByRole("table");
    expect(
      within(table).getByRole("link", { name: "Riverside Public Library" }),
    ).toHaveAttribute("href", "/libraries/lib_riverside");
    expect(within(table).getByRole("link", { name: "View" })).toHaveAttribute(
      "href",
      "/libraries/lib_riverside",
    );

    const lastSent = within(table).getByRole("cell", {
      name: /Mar 15, 2026/,
    });
    expect(within(lastSent).getByRole("link")).toHaveAttribute(
      "href",
      "/distribution/dist_latest",
    );
  });

  it("formats counts and stacked revenue from the list payload", () => {
    render(<LibrariesTable libraries={[library]} />);

    const row = screen.getAllByRole("row")[1];
    expect(within(row).getByText("20")).toBeVisible();
    expect(within(row).getByText("11")).toBeVisible();
    expect(within(row).getByText("7")).toBeVisible();
    expect(within(row).getByText(/15,000/)).toBeVisible();
    expect(within(row).getByText("$25.00")).toBeVisible();
    expect(within(row).getByText("Linked")).toBeVisible();
    expect(within(row).getByText("Active")).toBeVisible();
  });

  it("keeps zeros and missing revenue visible as 0 or —", () => {
    render(
      <LibrariesTable
        libraries={[
          {
            ...library,
            lastDispatchedAt: null,
            lastDistributionId: null,
            totalDistributed: 0,
            revenueByCurrency: [],
            stock: { ...library.stock, onHand: 0, sold: 0 },
          },
        ]}
      />,
    );

    const row = screen.getAllByRole("row")[1];
    expect(within(row).getAllByText("—")).toHaveLength(2);
    expect(within(row).getAllByText("0")).toHaveLength(3);
    expect(within(row).queryByText("hello@riverside.example")).not.toBeInTheDocument();
  });

  it("shows — for last sent, distributed, and sales when the API omitted those fields", () => {
    const withoutLedger: LibraryListItem = {
      id: library.id,
      name: library.name,
      slug: library.slug,
      email: library.email,
      phone: library.phone,
      address: library.address,
      isActive: library.isActive,
      createdAt: library.createdAt,
      updatedAt: library.updatedAt,
      _count: library._count,
      link: library.link,
      stock: library.stock,
    };

    render(<LibrariesTable libraries={[withoutLedger]} />);

    const row = screen.getAllByRole("row")[1];
    expect(within(row).getAllByText("—")).toHaveLength(3);
    expect(within(row).getByText("11")).toBeVisible();
    expect(within(row).getByText("7")).toBeVisible();
  });
});
