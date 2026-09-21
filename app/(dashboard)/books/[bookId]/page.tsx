import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BookDetailView } from "@/components/books/book-detail";
import { ApiError } from "@/lib/api/server";
import { getBook } from "@/lib/books/get-books";
import { getEditionLibraryPerformance } from "@/lib/edition-performance/get-edition-performance";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ bookId: string }>;
}): Promise<Metadata> {
  const { bookId } = await params;
  try {
    const book = await getBook(bookId);
    return { title: book.title };
  } catch {
    return { title: "Book" };
  }
}

export default async function BookDetailPage({
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

  const settledPerformance = await Promise.allSettled(
    book.editions.map((edition) => getEditionLibraryPerformance(edition.id)),
  );
  const editionPerformance = settledPerformance.map((result, index) => {
    const editionId = book.editions[index].id;
    if (result.status === "fulfilled") {
      return {
        editionId,
        report: result.value,
        errorMessage: null,
      };
    }

    const error: unknown = result.reason;
    if (!(error instanceof ApiError)) {
      throw error;
    }
    return {
      editionId,
      report: null,
      errorMessage: error.message,
    };
  });

  return (
    <BookDetailView book={book} editionPerformance={editionPerformance} />
  );
}
