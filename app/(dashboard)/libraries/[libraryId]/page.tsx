import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LibraryDetailView } from "@/components/libraries/library-detail";
import { ApiError } from "@/lib/api/server";
import { requirePublisherSession } from "@/lib/auth/session";
import { getDistributions } from "@/lib/distribution/get-distributions";
import type { DistributionListItem } from "@/lib/distribution/types";
import {
  getLibrary,
  getLibraryEditionPerformance,
  getLibraryPublisherPerformance,
} from "@/lib/libraries/get-libraries";
import type {
  LibraryEditionPerformance,
  LibraryPublisherPerformance,
} from "@/lib/libraries/types";
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

function settledValue<T>(result: PromiseSettledResult<T>): T | null {
  return result.status === "fulfilled" ? result.value : null;
}

function settledApiError(result: PromiseSettledResult<unknown>): string | null {
  if (result.status === "fulfilled") {
    return null;
  }
  const error: unknown = result.reason;
  if (error instanceof ApiError) {
    return error.message;
  }
  throw error;
}

export default async function LibraryDetailPage({
  params,
}: {
  params: Promise<{ libraryId: string }>;
}) {
  const user = await requirePublisherSession();
  const { libraryId } = await params;
  const loadPublisherLedger = Boolean(user.publisherId);

  const [
    libraryResult,
    performanceResult,
    editionPerformanceResult,
    shipmentsResult,
  ] = await Promise.allSettled([
    getLibrary(libraryId),
    loadPublisherLedger
      ? getLibraryPublisherPerformance(libraryId)
      : Promise.resolve(null),
    loadPublisherLedger
      ? getLibraryEditionPerformance(libraryId)
      : Promise.resolve(null),
    getDistributions({ libraryId, page: 1, limit: 10 }),
  ]);

  if (libraryResult.status === "rejected") {
    const error: unknown = libraryResult.reason;
    if (error instanceof ApiError && error.status === 404) {
      notFound();
    }
    throw error;
  }

  const performance = settledValue(
    performanceResult,
  ) as LibraryPublisherPerformance | null;
  const performanceError = settledApiError(performanceResult);
  const editionPerformance = settledValue(
    editionPerformanceResult,
  ) as LibraryEditionPerformance | null;
  const editionPerformanceError = settledApiError(editionPerformanceResult);
  const shipmentsPage = settledValue(shipmentsResult);
  const shipmentsError = settledApiError(shipmentsResult);
  const shipments: DistributionListItem[] = shipmentsPage?.data ?? [];
  const shipmentsTotal = shipmentsPage?.meta.total ?? 0;

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
      library={libraryResult.value}
      performance={performance}
      performanceError={performanceError}
      editionPerformance={editionPerformance}
      editionPerformanceError={editionPerformanceError}
      shipments={shipments}
      shipmentsError={shipmentsError}
      shipmentsTotal={shipmentsTotal}
      role={user.role}
      portalUsers={portalUsers}
    />
  );
}
