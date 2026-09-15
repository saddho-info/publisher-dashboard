import type { Metadata } from "next";
import { PageHeader } from "@/components/dashboard/page-header";
import { LibraryForm } from "@/components/libraries/library-form";
import { requirePublisherSession } from "@/lib/auth/session";
import { createLibraryAction } from "@/lib/libraries/actions";
import { getPublishersForSelect } from "@/lib/libraries/get-libraries";
import { canManageLibraries } from "@/lib/libraries/types";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Add library",
};

export default async function NewLibraryPage() {
  const user = await requirePublisherSession();
  if (!canManageLibraries(user.role)) {
    redirect("/libraries");
  }

  const showPublisherSelect = user.role === "SUPER_ADMIN";
  const publishers = showPublisherSelect ? await getPublishersForSelect() : [];

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Add library"
        description="Create a partner library and link it to this publisher. The library can sign in once a library admin is invited."
      />
      <LibraryForm
        action={createLibraryAction}
        publishers={publishers}
        showPublisherSelect={showPublisherSelect}
        showPartnershipNotes
        cancelHref="/libraries"
        submitLabel="Create library"
      />
    </div>
  );
}
