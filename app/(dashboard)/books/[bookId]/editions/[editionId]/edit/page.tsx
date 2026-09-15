import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { EditionForm } from "@/components/books/edition-form";
import { PageHeader } from "@/components/dashboard/page-header";
import { ApiError } from "@/lib/api/server";
import { updateEditionAction } from "@/lib/books/actions";
import { getBook, getEdition } from "@/lib/books/get-books";

export const metadata: Metadata = {
  title: "Edit edition",
};

export default async function EditEditionPage({
  params,
}: {
  params: Promise<{ bookId: string; editionId: string }>;
}) {
  const { bookId, editionId } = await params;
  const [book, edition] = await Promise.all([
    getBook(bookId).catch((error: unknown) => {
      if (error instanceof ApiError && error.status === 404) {
        notFound();
      }
      throw error;
    }),
    getEdition(editionId).catch((error: unknown) => {
      if (
        error instanceof ApiError &&
        (error.status === 404 || error.status === 403)
      ) {
        notFound();
      }
      throw error;
    }),
  ]);

  if (edition.bookId !== book.id) {
    notFound();
  }

  const action = updateEditionAction.bind(null, book.id, edition.id);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={`Edit edition · ${book.title}`}
        description="Update ISBN, format, or list price for this print run."
      />
      <EditionForm
        action={action}
        edition={edition}
        cancelHref={`/books/${book.id}`}
        submitLabel="Save edition"
      />
    </div>
  );
}
