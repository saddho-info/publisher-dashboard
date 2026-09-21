import type { Metadata } from "next";
import { BookForm } from "@/components/books/book-form";
import { PageHeader } from "@/components/dashboard/page-header";
import { createBookAction } from "@/lib/books/actions";
import { getPublishersForSelect } from "@/lib/publishers/get-publishers";
import { requirePublisherSession } from "@/lib/auth/session";

export const metadata: Metadata = {
  title: "Add book",
};

export default async function NewBookPage() {
  const user = await requirePublisherSession();
  const showPublisherSelect = user.role === "SUPER_ADMIN";
  const publishers = showPublisherSelect ? await getPublishersForSelect() : [];

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Add book"
        description="A title in the catalog. Add print editions after you save."
      />
      <BookForm
        action={createBookAction}
        publishers={publishers}
        showPublisherSelect={showPublisherSelect}
        cancelHref="/books"
        submitLabel="Create book"
      />
    </div>
  );
}
