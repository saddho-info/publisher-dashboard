import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { PageHeader } from "@/components/dashboard/page-header";
import { PublisherForm } from "@/components/publishers/publisher-form";
import { ApiError } from "@/lib/api/server";
import { requirePublisherSession } from "@/lib/auth/session";
import { updatePublisherAction } from "@/lib/publishers/actions";
import { getPublisher } from "@/lib/publishers/get-publishers";
import { canManagePublishers } from "@/lib/publishers/types";

export const metadata: Metadata = {
  title: "Edit publisher",
};

export default async function EditPublisherPage({
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
  const action = updatePublisherAction.bind(null, publisher.id);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={`Edit ${publisher.name}`}
        description="Update organization details or activate/deactivate this publisher."
      />
      <PublisherForm
        action={action}
        publisher={publisher}
        cancelHref={`/publishers/${publisher.id}`}
        submitLabel="Save changes"
      />
    </div>
  );
}
