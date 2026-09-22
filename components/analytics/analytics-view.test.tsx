import { render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";
import { AnalyticsView } from "@/components/analytics/analytics-view";
import { OVERVIEW_FIXTURE } from "@/lib/overview/fixture";
import { isNavActive, NAV_ITEMS } from "@/lib/navigation";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: vi.fn(), push: vi.fn() }),
  usePathname: () => "/analytics",
  useSearchParams: () => new URLSearchParams(),
}));

vi.mock("next/link", () => ({
  default: ({ children, href }: { children: ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

describe("AnalyticsView", () => {
  it("still renders the existing analytics report", () => {
    render(<AnalyticsView data={OVERVIEW_FIXTURE} />);

    expect(
      screen.getByRole("heading", { name: "Analytics", level: 1 }),
    ).toBeVisible();
    expect(screen.getByRole("link", { name: "Open alerts" })).toHaveAttribute(
      "href",
      "/alerts",
    );
    expect(screen.getByText("The Silent Archive")).toBeVisible();
  });

  it("links to the edition performance report", () => {
    render(<AnalyticsView data={OVERVIEW_FIXTURE} />);

    expect(
      screen.getByRole("link", { name: "Edition performance" }),
    ).toHaveAttribute("href", "/analytics/edition-performance");
  });
});

describe("dashboard navigation", () => {
  it("keeps Analytics active on the edition performance subpage", () => {
    expect(isNavActive("/analytics/edition-performance", "/analytics")).toBe(
      true,
    );
  });

  it("does not add a sidebar item for the subpage", () => {
    expect(NAV_ITEMS.map((item) => item.href)).toEqual([
      "/dashboard",
      "/books",
      "/inventory",
      "/libraries",
      "/distribution",
      "/sales",
      "/analytics",
      "/alerts",
      "/reports",
      "/users",
      "/settings",
    ]);
  });
});
