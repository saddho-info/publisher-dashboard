import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { PageHeader } from "@/components/dashboard/page-header";
import { LibraryPortalUserForm } from "@/components/libraries/library-portal-user-form";
import { ApiError } from "@/lib/api/server";
import { requirePublisherSession } from "@/lib/auth/session";
import { getLibrary } from "@/lib/libraries/get-libraries";
import { createLibraryUserAction } from "@/lib/users/actions";
import { canManageLibraryPortalAccess } from "@/lib/users/types";

export const metadata: Metadata = {
  title: "Add portal account",
};

export default async function NewLibraryPortalUserPage({
  params,
}: {
  params: Promise<{ libraryId: string }>;
}) {
  const user = await requirePublisherSession();
  if (!canManageLibraryPortalAccess(user.role)) {
    redirect("/libraries");
  }

  const { libraryId } = await params;
  const library = await getLibrary(libraryId).catch((error: unknown) => {
    if (error instanceof ApiError && error.status === 404) {
      notFound();
    }
    throw error;
  });

  const action = createLibraryUserAction.bind(null, libraryId);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Add portal account"
        description={`Create a library admin or staff account for ${library.name}. Set a temporary password and share it with the contact.`}
      />
      <LibraryPortalUserForm
        action={action}
        cancelHref={`/libraries/${libraryId}`}
        submitLabel="Create portal account"
        defaultRole="LIBRARY_ADMIN"
      />
    </div>
  );
}
