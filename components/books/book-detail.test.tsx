import { render, screen, within } from "@testing-library/react";
import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";
import {
  BookDetailView,
  type BookEditionPerformance,
} from "@/components/books/book-detail";
import type { BookDetail } from "@/lib/books/types";
import type { EditionPerformanceReport } from "@/lib/edition-performance/types";

vi.mock("next/link", () => ({
  default: ({ children, href }: { children: ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

const book: BookDetail = {
  id: "book_silent",
  publisherId: "pub_northwind",
  title: "The Silent Archive",
  subtitle: null,
  authors: "Author Name",
  language: "en",
  category: "Fiction",
  description: "A catalog description.",
  coverImageUrl: null,
  slug: "the-silent-archive",
  isActive: true,
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-02T00:00:00.000Z",
  publisher: {
    id: "pub_northwind",
    name: "Northwind Press",
    slug: "northwind-press",
  },
  _count: { editions: 2 },
  editions: [
    {
      id: "ed_hardcover",
      bookId: "book_silent",
      isbn: "9781234567890",
      isbn10: null,
      format: "HARDCOVER",
      title: null,
      publicationDate: "2026-01-01",
      pageCount: 300,
      listPriceCents: 2000,
      currency: "USD",
      coverImageUrl: null,
      isActive: true,
      createdAt: "2026-01-01T00:00:00.000Z",
      updatedAt: "2026-01-02T00:00:00.000Z",
    },
    {
      id: "ed_paperback",
      bookId: "book_silent",
      isbn: "9781234567891",
      isbn10: null,
      format: "PAPERBACK",
      title: "Reader edition",
      publicationDate: "2026-02-01",
      pageCount: 320,
      listPriceCents: 1500,
      currency: "USD",
      coverImageUrl: null,
      isActive: true,
      createdAt: "2026-01-03T00:00:00.000Z",
      updatedAt: "2026-01-04T00:00:00.000Z",
    },
  ],
};

function report(
  editionId: string,
  format: "HARDCOVER" | "PAPERBACK",
  isbn: string,
  distributed: number,
): EditionPerformanceReport {
  return {
    book: {
      id: book.id,
      title: book.title,
      authors: book.authors,
      publisherId: book.publisherId,
    },
    edition: {
      id: editionId,
      bookId: book.id,
      title: null,
      format,
      isbn,
      isbn10: null,
      listPriceCents: 2000,
      currency: "USD",
    },
    summary: {
      libraryCount: 1,
      totalDistributed: distributed,
      inStock: distributed - 2,
      inTransit: 1,
      sold: 1,
      revenueByCurrency: [{ currency: "USD", totalCents: 2000 }],
    },
    libraries: [
      {
        library: {
          id: `lib_${editionId}`,
          name: `${format} Library`,
          slug: `${format.toLowerCase()}-library`,
        },
        totalDistributed: distributed,
        inStock: distributed - 2,
        inTransit: 1,
        sold: 1,
        revenueByCurrency: [{ currency: "USD", totalCents: 2000 }],
      },
    ],
  };
}

const editionPerformance: BookEditionPerformance[] = [
  {
    editionId: "ed_hardcover",
    report: report("ed_hardcover", "HARDCOVER", "9781234567890", 12),
    errorMessage: null,
  },
  {
    editionId: "ed_paperback",
    report: report("ed_paperback", "PAPERBACK", "9781234567891", 8),
    errorMessage: null,
  },
];

describe("BookDetailView edition analytics", () => {
  it("keeps each edition's performance in a separate section", () => {
    render(
      <BookDetailView
        book={book}
        editionPerformance={editionPerformance}
      />,
    );

    const hardcover = screen.getByRole("article", {
      name: "Hardcover · ISBN 978-123456789-0 analytics",
    });
    const paperback = screen.getByRole("article", {
      name: "Paperback · ISBN 978-123456789-1 analytics",
    });

    expect(within(hardcover).getAllByText("12").length).toBeGreaterThan(0);
    expect(
      within(hardcover).getAllByText("HARDCOVER Library").length,
    ).toBeGreaterThan(0);
    expect(within(paperback).getAllByText("8").length).toBeGreaterThan(0);
    expect(
      within(paperback).getAllByText("PAPERBACK Library").length,
    ).toBeGreaterThan(0);
    expect(
      within(hardcover).getByRole("link", { name: "View sales for this edition" }),
    ).toHaveAttribute("href", "/sales?editionId=ed_hardcover");
    expect(
      within(hardcover).getByRole("link", { name: "Full report" }),
    ).toHaveAttribute(
      "href",
      "/analytics/edition-performance?editionId=ed_hardcover",
    );
    expect(
      within(paperback).getByRole("link", { name: "Full report" }),
    ).toHaveAttribute(
      "href",
      "/analytics/edition-performance?editionId=ed_paperback",
    );
  });

  it("places edition analytics above the catalog and keeps stock links", () => {
    render(
      <BookDetailView
        book={book}
        editionPerformance={editionPerformance}
      />,
    );

    expect(screen.getByText("Where this title sits and sells.")).toBeVisible();

    const analytics = screen.getByRole("heading", {
      name: "Edition analytics",
    });
    const catalog = screen.getByRole("heading", { name: "Editions" });
    const about = screen.getByRole("heading", { name: "About this title" });
    expect(analytics.compareDocumentPosition(catalog)).toBe(
      Node.DOCUMENT_POSITION_FOLLOWING,
    );
    expect(catalog.compareDocumentPosition(about)).toBe(
      Node.DOCUMENT_POSITION_FOLLOWING,
    );

    expect(
      within(screen.getAllByRole("table")[0]).getByRole("link", {
        name: "HARDCOVER Library",
      }),
    ).toHaveAttribute("href", "/libraries/lib_ed_hardcover");
    const stockLinks = screen.getAllByRole("link", { name: "Stock" });
    expect(stockLinks[0]).toHaveAttribute("href", "/inventory/ed_hardcover");
    expect(screen.getByText("978-123456789-0")).toBeVisible();
  });
});
