import { render, screen } from "@testing-library/react";
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
};

describe("BooksTable", () => {
  it("links each book to its edition analytics on the detail route", () => {
    render(<BooksTable books={[book]} />);

    expect(
      screen.getByRole("columnheader", { name: "Analytics" }),
    ).toBeVisible();
    expect(screen.getByRole("link", { name: "View" })).toHaveAttribute(
      "href",
      "/books/book_silent",
    );
  });
});
