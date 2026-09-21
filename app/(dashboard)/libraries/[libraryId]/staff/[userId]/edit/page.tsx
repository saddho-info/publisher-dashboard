import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { PageHeader } from "@/components/dashboard/page-header";
import { LibraryPortalUserForm } from "@/components/libraries/library-portal-user-form";
import { ApiError } from "@/lib/api/server";
import { requirePublisherSession } from "@/lib/auth/session";
import { getLibrary } from "@/lib/libraries/get-libraries";
import { updateLibraryUserAction } from "@/lib/users/actions";
import { getLibraryUser } from "@/lib/users/get-users";
import { canManageLibraryPortalAccess } from "@/lib/users/types";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ libraryId: string; userId: string }>;
}): Promise<Metadata> {
  const { userId } = await params;
  try {
    const account = await getLibraryUser(userId);
    return {
      title: `Edit ${account.firstName} ${account.lastName}`,
    };
  } catch {
    return { title: "Edit portal account" };
  }
}

export default async function EditLibraryPortalUserPage({
  params,
}: {
  params: Promise<{ libraryId: string; userId: string }>;
}) {
  const sessionUser = await requirePublisherSession();
  if (!canManageLibraryPortalAccess(sessionUser.role)) {
    redirect("/libraries");
  }

  const { libraryId, userId } = await params;
  const library = await getLibrary(libraryId).catch((error: unknown) => {
    if (error instanceof ApiError && error.status === 404) {
      notFound();
    }
    throw error;
  });

  const account = await getLibraryUser(userId).catch((error: unknown) => {
    if (error instanceof ApiError && error.status === 404) {
      notFound();
    }
    throw error;
  });

  if (account.libraryId !== libraryId) {
    notFound();
  }

  const action = updateLibraryUserAction.bind(null, libraryId, userId);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={`Edit ${account.firstName} ${account.lastName}`}
        description={`Portal account for ${library.name}. Update details, role, or set a new temporary password.`}
      />
      <LibraryPortalUserForm
        action={action}
        user={account}
        cancelHref={`/libraries/${libraryId}`}
        submitLabel="Save changes"
      />
    </div>
  );
}
