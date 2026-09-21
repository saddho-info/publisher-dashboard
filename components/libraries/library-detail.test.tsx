import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { LibraryDetailView } from "@/components/libraries/library-detail";
import type { LibraryDetail } from "@/lib/libraries/types";
import type { LibraryUser } from "@/lib/users/types";

vi.mock("next/link", () => ({
  default: ({
    children,
    href,
  }: {
    children: React.ReactNode;
    href: string;
  }) => <a href={href}>{children}</a>,
}));

vi.mock("@/components/libraries/partnership-form", () => ({
  PartnershipForm: () => <div>Partnership form</div>,
}));

vi.mock("@/components/libraries/unlink-library-button", () => ({
  UnlinkLibraryButton: () => <button type="button">Unlink</button>,
}));

const library: LibraryDetail = {
  id: "lib_1",
  name: "Riverside Public",
  slug: "riverside-public",
  email: "desk@riverside.example",
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

const portalUser: LibraryUser = {
  id: "user_la",
  email: "admin@riverside.example",
  firstName: "River",
  lastName: "Admin",
  role: "LIBRARY_ADMIN",
  isActive: true,
  publisherId: null,
  libraryId: "lib_1",
  createdAt: "2026-01-01",
  updatedAt: "2026-01-01",
};

describe("LibraryDetailView portal access", () => {
  it("shows portal access for SUPER_ADMIN", () => {
    render(
      <LibraryDetailView
        library={library}
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
