import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LibraryDetailView } from "@/components/libraries/library-detail";
import { ApiError } from "@/lib/api/server";
import { requirePublisherSession } from "@/lib/auth/session";
import { getLibrary } from "@/lib/libraries/get-libraries";
import { getLibraryUsers } from "@/lib/users/get-users";
import { canManageLibraryPortalAccess } from "@/lib/users/types";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ libraryId: string }>;
}): Promise<Metadata> {
  const { libraryId } = await params;
  try {
    const library = await getLibrary(libraryId);
    return { title: library.name };
  } catch {
    return { title: "Library" };
  }
}

export default async function LibraryDetailPage({
  params,
}: {
  params: Promise<{ libraryId: string }>;
}) {
  const user = await requirePublisherSession();
  const { libraryId } = await params;
  const library = await getLibrary(libraryId).catch((error: unknown) => {
    if (error instanceof ApiError && error.status === 404) {
      notFound();
    }
    throw error;
  });

  const portalUsers = canManageLibraryPortalAccess(user.role)
    ? (
        await getLibraryUsers({ libraryId, limit: 100 }).catch(() => ({
          data: [],
          meta: { page: 1, limit: 100, total: 0, totalPages: 0 },
        }))
      ).data
    : [];

  return (
    <LibraryDetailView
      library={library}
      role={user.role}
      portalUsers={portalUsers}
    />
  );
}
