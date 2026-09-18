import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { DistributionForm } from "@/components/distribution/distribution-form";
import type { InventoryRollup } from "@/lib/inventory/types";
import type { LibraryListItem } from "@/lib/libraries/types";

vi.mock("next/link", () => ({
  default: ({
    children,
    href,
  }: {
    children: React.ReactNode;
    href: string;
  }) => <a href={href}>{children}</a>,
}));

vi.mock("@/lib/distribution/actions", () => ({
  createDistributionAction: vi.fn(async () => ({})),
}));

const library: LibraryListItem = {
  id: "lib_1",
  name: "Riverside",
  slug: "riverside",
  email: null,
  phone: null,
  address: null,
  isActive: true,
  createdAt: "2026-01-01",
  updatedAt: "2026-01-01",
  _count: { users: 1 },
  link: {
    id: "link_1",
    publisherId: "pub_1",
    isActive: true,
    notes: null,
    createdAt: "2026-01-01",
    updatedAt: "2026-01-01",
  },
  stock: {
    onHand: 0,
    inTransit: 0,
    sold: 0,
    returned: 0,
    lost: 0,
    copyCount: 0,
  },
};

const edition: InventoryRollup = {
  editionId: "ed_1",
  isbn: "9781402894626",
  isbn10: null,
  format: "HARDCOVER",
  editionTitle: null,
  listPriceCents: 2499,
  currency: "USD",
  isActive: true,
  book: {
    id: "book_1",
    title: "Silent Archive",
    authors: "Lina",
    publisherId: "pub_1",
    slug: "silent-archive",
    coverImageUrl: null,
  },
  warehouseOnHand: 5,
  libraryOnHand: 0,
  inTransit: 0,
  sold: 0,
  returned: 0,
  lost: 0,
  totalOnHand: 5,
  lowStockThreshold: 2,
  isLowStock: false,
  copyCount: 5,
  holdings: [],
};

describe("DistributionForm", () => {
  it("shows library and edition fields for the allocation workflow", async () => {
    const user = userEvent.setup();
    render(
      <DistributionForm
        libraries={[library]}
        editions={[edition]}
        publishers={[{ id: "pub_1", name: "Northwind" }]}
        showPublisherSelect={false}
      />,
    );

    expect(screen.getByLabelText(/^Library/)).toBeInTheDocument();
    expect(screen.getByLabelText(/^Edition/)).toBeInTheDocument();

    await user.selectOptions(screen.getByLabelText(/^Library/), "lib_1");
    expect(screen.getByLabelText(/^Library/)).toHaveValue("lib_1");
  });
});
