import { render, screen, within } from "@testing-library/react";
import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";
import { BooksTable } from "@/components/books/books-table";
import type { BookListItem } from "@/lib/books/types";

vi.mock("next/link", () => ({
  default: ({ children, href }: { children: ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

const book: BookListItem = {
  id: "book_silent",
  publisherId: "pub_northwind",
  title: "The Silent Archive",
  subtitle: null,
  authors: "Author Name",
  language: "en",
  category: "Fiction",
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
  libraryStock: 11,
  sold: 8,
  revenueByCurrency: [{ currency: "USD", totalCents: 12000 }],
};

describe("BooksTable", () => {
  it("links each book to its edition analytics on the detail route", () => {
    render(<BooksTable books={[book]} />);

    expect(
      screen.getByRole("columnheader", { name: "Analytics" }),
    ).toBeVisible();
    const table = screen.getByRole("table");
    expect(within(table).getByRole("link", { name: "View" })).toHaveAttribute(
      "href",
      "/books/book_silent",
    );
    expect(
      within(table).getByRole("link", { name: "The Silent Archive" }),
    ).toHaveAttribute("href", "/books/book_silent");
  });

  it("shows in libraries, sold, and sales at a glance", () => {
    render(<BooksTable books={[book]} />);

    expect(
      screen.getByRole("columnheader", { name: "In libraries" }),
    ).toBeVisible();
    expect(screen.getByRole("columnheader", { name: "Sold" })).toBeVisible();
    expect(screen.getByRole("columnheader", { name: "Sales" })).toBeVisible();
    expect(
      screen.queryByRole("columnheader", { name: "Category" }),
    ).not.toBeInTheDocument();

    const row = screen.getAllByRole("row")[1];
    expect(within(row).getByText("11")).toBeVisible();
    expect(within(row).getByText("8")).toBeVisible();
    expect(within(row).getByText("$120.00")).toBeVisible();
    expect(within(row).getByText("Author Name")).toBeVisible();
    expect(within(row).getByText("Active")).toBeVisible();
    expect(within(row).getByText("Fiction")).toBeVisible();
  });

  it("keeps zeros visible and missing movement as —", () => {
    render(
      <BooksTable
        books={[
          {
            ...book,
            libraryStock: 0,
            sold: 0,
            revenueByCurrency: [],
          },
        ]}
      />,
    );

    const row = screen.getAllByRole("row")[1];
    expect(within(row).getAllByText("0")).toHaveLength(2);
    expect(within(row).getByText("—")).toBeVisible();
  });

  it("shows — when the list payload omitted stock, sold, and sales", () => {
    const withoutMovement: BookListItem = {
      id: book.id,
      publisherId: book.publisherId,
      title: book.title,
      subtitle: book.subtitle,
      authors: book.authors,
      language: book.language,
      category: book.category,
      coverImageUrl: book.coverImageUrl,
      slug: book.slug,
      isActive: book.isActive,
      createdAt: book.createdAt,
      updatedAt: book.updatedAt,
      publisher: book.publisher,
      _count: book._count,
    };

    render(<BooksTable books={[withoutMovement]} />);

    const row = screen.getAllByRole("row")[1];
    expect(within(row).getAllByText("—")).toHaveLength(3);
  });
});
