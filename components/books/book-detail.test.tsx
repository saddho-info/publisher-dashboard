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
      name: "Hardcover · ISBN 9781234567890 analytics",
    });
    const paperback = screen.getByRole("article", {
      name: "Paperback · ISBN 9781234567891 analytics",
    });

    expect(within(hardcover).getByText("12")).toBeVisible();
    expect(within(hardcover).getByText("HARDCOVER Library")).toBeVisible();
    expect(within(paperback).getByText("8")).toBeVisible();
    expect(within(paperback).getByText("PAPERBACK Library")).toBeVisible();
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
});
