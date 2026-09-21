import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { PageHeader } from "@/components/dashboard/page-header";
import { PublisherForm } from "@/components/publishers/publisher-form";
import { requirePublisherSession } from "@/lib/auth/session";
import { createPublisherAction } from "@/lib/publishers/actions";
import { canManagePublishers } from "@/lib/publishers/types";

export const metadata: Metadata = {
  title: "Add publisher",
};

export default async function NewPublisherPage() {
  const user = await requirePublisherSession();
  if (!canManagePublishers(user.role)) {
    redirect("/dashboard");
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Add publisher"
        description="Create a publisher organization. Staff can sign in once accounts are invited."
      />
      <PublisherForm
        action={createPublisherAction}
        cancelHref="/publishers"
        submitLabel="Create publisher"
      />
    </div>
  );
}
