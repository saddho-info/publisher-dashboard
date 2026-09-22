import type { Metadata } from "next";
import { EditionPerformanceView } from "@/components/analytics/edition-performance/edition-performance-view";
import { ApiError } from "@/lib/api/server";
import { requirePublisherSession } from "@/lib/auth/session";
import { getEditionLibraryPerformance } from "@/lib/edition-performance/get-edition-performance";
import type { EditionPerformanceReport } from "@/lib/edition-performance/types";

export const metadata: Metadata = {
  title: "Edition performance",
};

export default async function EditionPerformancePage({
  searchParams,
}: {
  searchParams: Promise<{ editionId?: string | string[] }>;
}) {
  await requirePublisherSession();
  const params = await searchParams;
  const requested = Array.isArray(params.editionId)
    ? params.editionId[0]
    : params.editionId;
  const selectedEditionId = requested?.trim() ?? "";

  let report: EditionPerformanceReport | null = null;
  let errorMessage: string | null = null;

  if (selectedEditionId) {
    try {
      report = await getEditionLibraryPerformance(selectedEditionId);
    } catch (error) {
      if (!(error instanceof ApiError)) {
        throw error;
      }
      errorMessage = error.message;
    }
  }

  return (
    <EditionPerformanceView
      selectedEditionId={selectedEditionId}
      report={report}
      errorMessage={errorMessage}
    />
  );
}
