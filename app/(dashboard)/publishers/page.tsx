import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { PageHeader } from "@/components/dashboard/page-header";
import { PublishersFilters } from "@/components/publishers/publishers-filters";
import {
  PublishersPagination,
  PublishersTable,
} from "@/components/publishers/publishers-table";
import { buttonClassName } from "@/components/ui/button-styles";
import { EmptyState } from "@/components/ui/empty-state";
import { requirePublisherSession } from "@/lib/auth/session";
import { getPublishers } from "@/lib/publishers/get-publishers";
import { canManagePublishers } from "@/lib/publishers/types";

export const metadata: Metadata = {
  title: "Publishers",
};

export default async function PublishersPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; isActive?: string; page?: string }>;
}) {
  const user = await requirePublisherSession();
  if (!canManagePublishers(user.role)) {
    redirect("/dashboard");
  }

  const params = await searchParams;
  const search = params.search?.trim() ?? "";
  const isActiveParam = params.isActive ?? "true";
  const page = Math.max(1, Number(params.page) || 1);
  const isActive =
    isActiveParam === "all" ? undefined : isActiveParam !== "false";

  const result = await getPublishers({
    page,
    limit: 20,
    search: search || undefined,
    isActive,
  });

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Publishers"
        description="Create and manage publisher organizations across PubTrack."
        actions={
          <Link href="/publishers/new" className={buttonClassName()}>
            Add publisher
          </Link>
        }
      />

      <PublishersFilters search={search} isActive={isActiveParam} />

      {result.data.length === 0 ? (
        <EmptyState
          title={
            search || isActiveParam !== "true"
              ? "No matching publishers"
              : "No publishers yet"
          }
          description={
            search || isActiveParam !== "true"
              ? "Try a different search or status filter."
              : "Create a publisher organization before inviting staff or cataloging titles."
          }
          action={
            <Link href="/publishers/new" className={buttonClassName()}>
              Add publisher
            </Link>
          }
        />
      ) : (
        <>
          <PublishersTable publishers={result.data} />
          <PublishersPagination
            meta={result.meta}
            query={{ search, isActive: isActiveParam }}
          />
        </>
      )}
    </div>
  );
}
