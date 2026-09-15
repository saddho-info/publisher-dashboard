import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LibraryDetailView } from "@/components/libraries/library-detail";
import { ApiError } from "@/lib/api/server";
import { requirePublisherSession } from "@/lib/auth/session";
import { getLibrary } from "@/lib/libraries/get-libraries";

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

  return <LibraryDetailView library={library} role={user.role} />;
}
