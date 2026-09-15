import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BookForm } from "@/components/books/book-form";
import { PageHeader } from "@/components/dashboard/page-header";
import { ApiError } from "@/lib/api/server";
import { updateBookAction } from "@/lib/books/actions";
import { getBook } from "@/lib/books/get-books";

export const metadata: Metadata = {
  title: "Edit book",
};

export default async function EditBookPage({
  params,
}: {
  params: Promise<{ bookId: string }>;
}) {
  const { bookId } = await params;
  const book = await getBook(bookId).catch((error: unknown) => {
    if (error instanceof ApiError && error.status === 404) {
      notFound();
    }
    throw error;
  });
  const action = updateBookAction.bind(null, book.id);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={`Edit ${book.title}`}
        description="Update catalog metadata. Editions are managed on the book page."
      />
      <BookForm
        action={action}
        book={book}
        cancelHref={`/books/${book.id}`}
        submitLabel="Save changes"
      />
    </div>
  );
}
