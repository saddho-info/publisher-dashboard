import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LibraryDetailView } from "@/components/libraries/library-detail";
import { ApiError } from "@/lib/api/server";
import { requirePublisherSession } from "@/lib/auth/session";
import {
  getLibrary,
  getLibraryPublisherPerformance,
} from "@/lib/libraries/get-libraries";

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
  const [libraryResult, performanceResult] = await Promise.allSettled([
    getLibrary(libraryId),
    user.publisherId ? getLibraryPublisherPerformance(libraryId) : null,
  ]);

  if (libraryResult.status === "rejected") {
    const error: unknown = libraryResult.reason;
    if (error instanceof ApiError && error.status === 404) {
      notFound();
    }
    throw error;
  }

  let performance = null;
  let performanceError: string | null = null;
  if (performanceResult.status === "fulfilled") {
    performance = performanceResult.value;
  } else {
    const error: unknown = performanceResult.reason;
    if (error instanceof ApiError) {
      performanceError = error.message;
    } else {
      throw error;
    }
  }

  return (
    <LibraryDetailView
      library={libraryResult.value}
      performance={performance}
      performanceError={performanceError}
      role={user.role}
    />
  );
}
