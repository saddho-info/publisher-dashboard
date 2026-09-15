import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { DistributionDetailView } from "@/components/distribution/distribution-detail";
import { ApiError } from "@/lib/api/server";
import { requirePublisherSession } from "@/lib/auth/session";
import { getDistribution } from "@/lib/distribution/get-distributions";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ distributionId: string }>;
}): Promise<Metadata> {
  const { distributionId } = await params;
  try {
    const distribution = await getDistribution(distributionId);
    return { title: distribution.code };
  } catch {
    return { title: "Shipment" };
  }
}

export default async function DistributionDetailPage({
  params,
}: {
  params: Promise<{ distributionId: string }>;
}) {
  const user = await requirePublisherSession();
  const { distributionId } = await params;
  const distribution = await getDistribution(distributionId).catch(
    (error: unknown) => {
      if (error instanceof ApiError && error.status === 404) {
        notFound();
      }
      throw error;
    },
  );

  return <DistributionDetailView distribution={distribution} role={user.role} />;
}
