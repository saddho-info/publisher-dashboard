import type { Metadata } from "next";
import { PageHeader } from "@/components/dashboard/page-header";
import { LinkLibraryForm } from "@/components/libraries/link-library-form";
import { requirePublisherSession } from "@/lib/auth/session";
import { linkLibraryAction } from "@/lib/libraries/actions";
import { getPublishersForSelect } from "@/lib/libraries/get-libraries";
import { canManageLibraries } from "@/lib/libraries/types";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Link library",
};

export default async function LinkLibraryPage() {
  const user = await requirePublisherSession();
  if (!canManageLibraries(user.role)) {
    redirect("/libraries");
  }

  const showPublisherSelect = user.role === "SUPER_ADMIN";
  const publishers = showPublisherSelect ? await getPublishersForSelect() : [];

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Link existing library"
        description="Partner with a library that already exists. Use their slug — there is no public directory of all libraries."
      />
      <LinkLibraryForm
        action={linkLibraryAction}
        publishers={publishers}
        showPublisherSelect={showPublisherSelect}
      />
    </div>
  );
}
