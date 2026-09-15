import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { PageHeader } from "@/components/dashboard/page-header";
import { LibraryForm } from "@/components/libraries/library-form";
import { ApiError } from "@/lib/api/server";
import { requirePublisherSession } from "@/lib/auth/session";
import { updateLibraryAction } from "@/lib/libraries/actions";
import { getLibrary } from "@/lib/libraries/get-libraries";
import { canManageLibraries } from "@/lib/libraries/types";

export const metadata: Metadata = {
  title: "Edit library",
};

export default async function EditLibraryPage({
  params,
}: {
  params: Promise<{ libraryId: string }>;
}) {
  const user = await requirePublisherSession();
  if (!canManageLibraries(user.role)) {
    redirect("/libraries");
  }

  const { libraryId } = await params;
  const library = await getLibrary(libraryId).catch((error: unknown) => {
    if (error instanceof ApiError && error.status === 404) {
      notFound();
    }
    throw error;
  });
  const action = updateLibraryAction.bind(null, library.id);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={`Edit ${library.name}`}
        description="Update contact details for this partner library."
      />
      <LibraryForm
        action={action}
        library={library}
        cancelHref={`/libraries/${library.id}`}
        submitLabel="Save changes"
      />
    </div>
  );
}
