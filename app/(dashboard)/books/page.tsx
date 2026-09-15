import type { Metadata } from "next";
import Link from "next/link";
import { BooksFilters } from "@/components/books/books-filters";
import { BooksPagination, BooksTable } from "@/components/books/books-table";
import { PageHeader } from "@/components/dashboard/page-header";
import { buttonClassName } from "@/components/ui/button-styles";
import { EmptyState } from "@/components/ui/empty-state";
import { getBooks } from "@/lib/books/get-books";

export const metadata: Metadata = {
  title: "Books",
};

export default async function BooksPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; isActive?: string; page?: string }>;
}) {
  const params = await searchParams;
  const search = params.search?.trim() ?? "";
  const isActiveParam = params.isActive ?? "true";
  const page = Math.max(1, Number(params.page) || 1);
  const isActive =
    isActiveParam === "all" ? undefined : isActiveParam !== "false";

  const result = await getBooks({
    page,
    limit: 20,
    search: search || undefined,
    isActive,
  });

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Books"
        description="Catalog titles and editions for this publisher."
        actions={
          <Link href="/books/new" className={buttonClassName()}>
            Add book
          </Link>
        }
      />

      <BooksFilters search={search} isActive={isActiveParam} />

      {result.data.length === 0 ? (
        <EmptyState
          title={search || isActiveParam !== "true" ? "No matching titles" : "No books yet"}
          description={
            search || isActiveParam !== "true"
              ? "Try a different search or status filter."
              : "Create a title, then add hardcover and paperback editions before generating copies."
          }
          action={
            <Link href="/books/new" className={buttonClassName()}>
              Add book
            </Link>
          }
        />
      ) : (
        <>
          <BooksTable books={result.data} />
          <BooksPagination
            meta={result.meta}
            query={{ search, isActive: isActiveParam }}
          />
        </>
      )}
    </div>
  );
}
