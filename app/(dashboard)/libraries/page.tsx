import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/dashboard/page-header";
import { LibrariesFilters } from "@/components/libraries/libraries-filters";
import {
  LibrariesPagination,
  LibrariesTable,
} from "@/components/libraries/libraries-table";
import { buttonClassName } from "@/components/ui/button-styles";
import { EmptyState } from "@/components/ui/empty-state";
import { requirePublisherSession } from "@/lib/auth/session";
import { getLibraries } from "@/lib/libraries/get-libraries";
import { canManageLibraries } from "@/lib/libraries/types";

export const metadata: Metadata = {
  title: "Libraries",
};

export default async function LibrariesPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; isActive?: string; page?: string }>;
}) {
  const user = await requirePublisherSession();
  const params = await searchParams;
  const search = params.search?.trim() ?? "";
  const isActiveParam = params.isActive ?? "true";
  const page = Math.max(1, Number(params.page) || 1);
  const isActive =
    isActiveParam === "all" ? undefined : isActiveParam !== "false";
  const canManage = canManageLibraries(user.role);

  const result = await getLibraries({
    page,
    limit: 20,
    search: search || undefined,
    isActive,
  });

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Libraries"
        description="Partner libraries this publisher can distribute stock to."
        actions={
          canManage ? (
            <div className="flex flex-wrap gap-2">
              <Link
                href="/libraries/link"
                className={buttonClassName({ variant: "outline" })}
              >
                Link existing
              </Link>
              <Link href="/libraries/new" className={buttonClassName()}>
                Add library
              </Link>
            </div>
          ) : null
        }
      />

      <LibrariesFilters search={search} isActive={isActiveParam} />

      {result.data.length === 0 ? (
        <EmptyState
          title={
            search || isActiveParam !== "true"
              ? "No matching libraries"
              : "No partner libraries yet"
          }
          description={
            search || isActiveParam !== "true"
              ? "Try a different search or status filter."
              : "Create a library or link one by slug before allocating stock."
          }
          action={
            canManage ? (
              <div className="flex flex-wrap justify-center gap-2">
                <Link
                  href="/libraries/link"
                  className={buttonClassName({ variant: "outline" })}
                >
                  Link existing
                </Link>
                <Link href="/libraries/new" className={buttonClassName()}>
                  Add library
                </Link>
              </div>
            ) : undefined
          }
        />
      ) : (
        <>
          <LibrariesTable libraries={result.data} />
          <LibrariesPagination
            meta={result.meta}
            query={{ search, isActive: isActiveParam }}
          />
        </>
      )}
    </div>
  );
}
