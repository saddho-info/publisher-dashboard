import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { PublisherDetailView } from "@/components/publishers/publisher-detail";
import { ApiError } from "@/lib/api/server";
import { requirePublisherSession } from "@/lib/auth/session";
import { getPublisher } from "@/lib/publishers/get-publishers";
import { canManagePublishers } from "@/lib/publishers/types";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ publisherId: string }>;
}): Promise<Metadata> {
  const { publisherId } = await params;
  try {
    const publisher = await getPublisher(publisherId);
    return { title: publisher.name };
  } catch {
    return { title: "Publisher" };
  }
}

export default async function PublisherDetailPage({
  params,
}: {
  params: Promise<{ publisherId: string }>;
}) {
  const user = await requirePublisherSession();
  if (!canManagePublishers(user.role)) {
    redirect("/dashboard");
  }

  const { publisherId } = await params;
  const publisher = await getPublisher(publisherId).catch((error: unknown) => {
    if (error instanceof ApiError && error.status === 404) {
      notFound();
    }
    throw error;
  });

  return <PublisherDetailView publisher={publisher} />;
}
