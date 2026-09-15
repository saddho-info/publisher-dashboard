import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BookDetailView } from "@/components/books/book-detail";
import { ApiError } from "@/lib/api/server";
import { getBook } from "@/lib/books/get-books";

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

  return <BookDetailView book={book} />;
}
