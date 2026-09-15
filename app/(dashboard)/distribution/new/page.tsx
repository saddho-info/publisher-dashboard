import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { PageHeader } from "@/components/dashboard/page-header";
import { DistributionForm } from "@/components/distribution/distribution-form";
import { buttonClassName } from "@/components/ui/button-styles";
import { EmptyState } from "@/components/ui/empty-state";
import { requirePublisherSession } from "@/lib/auth/session";
import { canWriteDistributions } from "@/lib/distribution/types";
import { getInventory } from "@/lib/inventory/get-inventory";
import {
  getLibraries,
  getPublishersForSelect,
} from "@/lib/libraries/get-libraries";

export const metadata: Metadata = {
  title: "New shipment",
};

export default async function NewDistributionPage({
  searchParams,
}: {
  searchParams: Promise<{ libraryId?: string; editionId?: string }>;
}) {
  const user = await requirePublisherSession();
  if (!canWriteDistributions(user.role)) {
    redirect("/distribution");
  }

  const params = await searchParams;
  const showPublisherSelect = user.role === "SUPER_ADMIN";
  const [libraries, inventory, publishers] = await Promise.all([
    getLibraries({ page: 1, limit: 100, isActive: true }),
    getInventory({ page: 1, limit: 100 }),
    showPublisherSelect ? getPublishersForSelect() : Promise.resolve([]),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="New shipment"
        description="Choose a linked library and the warehouse editions to send. Dispatch when the copies leave the warehouse."
      />
      {libraries.data.length === 0 ? (
        <EmptyState
          title="No partner libraries"
          description="Link a library before allocating stock."
          action={
            <Link href="/libraries" className={buttonClassName()}>
              Open libraries
            </Link>
          }
        />
      ) : inventory.data.length === 0 ? (
        <EmptyState
          title="No warehouse editions"
          description="Add a book edition and print copies before distributing."
          action={
            <Link href="/books" className={buttonClassName()}>
              Open catalog
            </Link>
          }
        />
      ) : (
        <DistributionForm
          libraries={libraries.data}
          editions={inventory.data}
          publishers={publishers}
          showPublisherSelect={showPublisherSelect}
          defaultLibraryId={params.libraryId}
          defaultEditionId={params.editionId}
        />
      )}
    </div>
  );
}
