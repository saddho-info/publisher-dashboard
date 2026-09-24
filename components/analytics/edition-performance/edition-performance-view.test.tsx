import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { EditionPerformanceView } from "@/components/analytics/edition-performance/edition-performance-view";
import type { EditionPerformanceReport } from "@/lib/edition-performance/types";

const push = vi.fn();
const router = { push, refresh: vi.fn() };

vi.mock("next/navigation", () => ({
  useRouter: () => router,
}));

vi.mock("next/link", () => ({
  default: ({ children, href }: { children: ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

const report: EditionPerformanceReport = {
  book: {
    id: "book_silent",
    title: "The Silent Archive",
    authors: "Author Name",
    publisherId: "pub_northwind",
  },
  edition: {
    id: "ed_hardcover",
    bookId: "book_silent",
    title: null,
    format: "HARDCOVER",
    isbn: "9781234567890",
    isbn10: null,
    listPriceCents: 1500,
    currency: "USD",
  },
  summary: {
    libraryCount: 2,
    totalDistributed: 20,
    inStock: 11,
    inTransit: 2,
    sold: 7,
    revenueByCurrency: [
      { currency: "USD", totalCents: 10500 },
      { currency: "EUR", totalCents: 4500 },
    ],
  },
  libraries: [
    {
      library: {
        id: "lib_riverside",
        name: "Riverside Public Library",
        slug: "riverside-public-library",
      },
      totalDistributed: 12,
      inStock: 7,
      inTransit: 1,
      sold: 4,
      revenueByCurrency: [{ currency: "USD", totalCents: 6000 }],
    },
    {
      library: {
        id: "lib_harbor",
        name: "Harbor Reading Room",
        slug: "harbor-reading-room",
      },
      totalDistributed: 8,
      inStock: 4,
      inTransit: 1,
      sold: 3,
      revenueByCurrency: [{ currency: "EUR", totalCents: 4500 }],
    },
  ],
};

beforeEach(() => {
  push.mockReset();
});

describe("EditionPerformanceView", () => {
  it("shows the search field and an informative empty state before selection", () => {
    render(
      <EditionPerformanceView
        selectedEditionId=""
        report={null}
        errorMessage={null}
      />,
    );

    expect(screen.getByLabelText("Search book edition")).toBeInTheDocument();
    expect(screen.getByText("Select a book edition")).toBeVisible();
    expect(screen.queryByRole("table")).not.toBeInTheDocument();
  });

  it("renders only the selected edition's details", () => {
    render(
      <EditionPerformanceView
        selectedEditionId="ed_hardcover"
        report={report}
        errorMessage={null}
      />,
    );

    expect(
      screen.getByRole("heading", { name: "The Silent Archive", level: 2 }),
    ).toBeVisible();
    expect(
      screen.getByText("Author Name · Hardcover · ISBN 9781234567890"),
    ).toBeVisible();
    expect(screen.getByText("$15.00")).toBeVisible();
    expect(screen.queryByText(/Paperback/)).not.toBeInTheDocument();
  });

  it("renders the KPI summary values", () => {
    render(
      <EditionPerformanceView
        selectedEditionId="ed_hardcover"
        report={report}
        errorMessage={null}
      />,
    );

    const kpis = screen.getByRole("region", {
      name: "Edition performance totals",
    });

    for (const [label, value] of [
      ["Partner libraries", "2"],
      ["Total distributed", "20"],
      ["Current library stock", "11"],
      ["In transit", "2"],
      ["Copies sold", "7"],
    ] as const) {
      const card = within(kpis).getByText(label).closest("div");
      expect(within(card as HTMLElement).getByText(value)).toBeVisible();
    }
  });

  it("formats revenue from cents and keeps currencies separate", () => {
    render(
      <EditionPerformanceView
        selectedEditionId="ed_hardcover"
        report={report}
        errorMessage={null}
      />,
    );

    const kpis = screen.getByRole("region", {
      name: "Edition performance totals",
    });
    expect(within(kpis).getByText("$105.00")).toBeVisible();
    expect(within(kpis).getByText("€45.00")).toBeVisible();
    expect(within(kpis).queryByText("$150.00")).not.toBeInTheDocument();
  });

  it("renders one table row per library in API order", () => {
    render(
      <EditionPerformanceView
        selectedEditionId="ed_hardcover"
        report={report}
        errorMessage={null}
      />,
    );

    const rows = screen.getAllByRole("row").slice(1);
    expect(rows).toHaveLength(2);

    const riverside = within(rows[0]);
    expect(
      riverside.getByRole("link", { name: "Riverside Public Library" }),
    ).toHaveAttribute("href", "/libraries/lib_riverside");
    expect(riverside.getByText("12")).toBeVisible();
    expect(riverside.getByText("$60.00")).toBeVisible();

    expect(
      screen.getByRole("link", { name: "View sales for this edition" }),
    ).toHaveAttribute("href", "/sales?editionId=ed_hardcover");

    expect(
      within(rows[1]).getByRole("link", { name: "Harbor Reading Room" }),
    ).toHaveAttribute("href", "/libraries/lib_harbor");
    expect(within(rows[1]).getByText("€45.00")).toBeVisible();
  });

  it("shows an empty report state when the edition has no library rows", () => {
    render(
      <EditionPerformanceView
        selectedEditionId="ed_hardcover"
        report={{
          ...report,
          summary: { ...report.summary, libraryCount: 0 },
          libraries: [],
        }}
        errorMessage={null}
      />,
    );

    expect(
      screen.getByText("No library activity for this edition"),
    ).toBeVisible();
    expect(screen.queryByRole("table")).not.toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "The Silent Archive", level: 2 }),
    ).toBeVisible();
  });

  it("shows a retryable error when the performance API fails", () => {
    render(
      <EditionPerformanceView
        selectedEditionId="ed_hardcover"
        report={null}
        errorMessage="Edition not found."
      />,
    );

    expect(screen.getByRole("alert")).toHaveTextContent("Edition not found.");
    expect(screen.getByRole("button", { name: "Try again" })).toBeVisible();
    expect(screen.queryByRole("table")).not.toBeInTheDocument();
  });

  it("removes editionId from the URL when the selection is cleared", async () => {
    const user = userEvent.setup();
    render(
      <EditionPerformanceView
        selectedEditionId="ed_hardcover"
        report={report}
        errorMessage={null}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Change edition" }));

    expect(push).toHaveBeenCalledWith("/analytics/edition-performance");
    expect(document.activeElement).toBe(
      screen.getByLabelText("Search book edition"),
    );
  });
});
