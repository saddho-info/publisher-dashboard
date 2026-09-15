import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { EditionForm } from "@/components/books/edition-form";
import { PageHeader } from "@/components/dashboard/page-header";
import { ApiError } from "@/lib/api/server";
import { createEditionAction } from "@/lib/books/actions";
import { getBook } from "@/lib/books/get-books";

export const metadata: Metadata = {
  title: "Add edition",
};

export default async function NewEditionPage({
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
  const action = createEditionAction.bind(null, book.id);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={`Add edition · ${book.title}`}
        description="ISBN, format, and list price. Copies and QR codes are generated in a later phase."
      />
      <EditionForm
        action={action}
        cancelHref={`/books/${book.id}`}
        submitLabel="Create edition"
      />
    </div>
  );
}
