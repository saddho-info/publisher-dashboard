import { render, screen } from "@testing-library/react";
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
};

describe("LibrariesTable", () => {
  it("links each library to its performance on the existing detail route", () => {
    render(<LibrariesTable libraries={[library]} />);

    expect(
      screen.getByRole("columnheader", { name: "Analytics" }),
    ).toBeVisible();
    expect(screen.getByRole("link", { name: "View" })).toHaveAttribute(
      "href",
      "/libraries/lib_riverside",
    );
    expect(
      screen.queryByRole("columnheader", { name: "Performance" }),
    ).not.toBeInTheDocument();
  });
});
