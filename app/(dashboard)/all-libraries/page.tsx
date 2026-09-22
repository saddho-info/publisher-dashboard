import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/dashboard/page-header";
import { LibrariesFilters } from "@/components/libraries/libraries-filters";
import { LibrariesTable } from "@/components/libraries/libraries-table";
import { buttonClassName } from "@/components/ui/button-styles";
import { EmptyState } from "@/components/ui/empty-state";
import { requireSuperAdmin } from "@/lib/auth/roles";
import { getLibraries } from "@/lib/libraries/get-libraries";

export const metadata: Metadata = { title: "All Libraries" };

export default async function AllLibrariesPage({ searchParams }: {
  searchParams: Promise<{ search?: string; isActive?: string; page?: string }>;
}) {
  await requireSuperAdmin();
  const params = await searchParams;
  const search = params.search?.trim() ?? "";
  const status = params.isActive ?? "all";
  const page = Math.max(1, Number(params.page) || 1);
  const result = await getLibraries({
    page, limit: 20, search: search || undefined,
    isActive: status === "all" ? undefined : status !== "false",
  });
  const pageHref = (next: number) => {
    const query = new URLSearchParams({ page: String(next), isActive: status });
    if (search) query.set("search", search);
    return `/all-libraries?${query}`;
  };
  return <div className="flex flex-col gap-6">
    <PageHeader title="All Libraries" description="Libraries across every publisher relationship." actions={<Link href="/libraries/new" className={buttonClassName()}>Add library</Link>} />
    <LibrariesFilters search={search} isActive={status} />
    {result.data.length ? <><LibrariesTable libraries={result.data} />
      {result.meta.totalPages > 1 ? <nav className="flex justify-between text-sm text-muted-foreground">
        <span>Page {result.meta.page} of {result.meta.totalPages} · {result.meta.total} libraries</span>
        <span className="flex gap-3">
          {page > 1 ? <Link href={pageHref(page - 1)}>Previous</Link> : <span className="opacity-40">Previous</span>}
          {page < result.meta.totalPages ? <Link href={pageHref(page + 1)}>Next</Link> : <span className="opacity-40">Next</span>}
        </span>
      </nav> : null}
    </> : <EmptyState title="No matching libraries" description="Try changing the filters or add a library." />}
  </div>;
}
