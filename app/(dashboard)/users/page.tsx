import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/dashboard/page-header";
import { UsersFilters, UsersPagination, UsersTable } from "@/components/users/user-management";
import { buttonClassName } from "@/components/ui/button-styles";
import { EmptyState } from "@/components/ui/empty-state";
import { requireSuperAdmin } from "@/lib/auth/roles";
import { getUsers } from "@/lib/users/get-users";

export const metadata: Metadata = {
  title: "Users",
};

export default async function UsersPage({ searchParams }: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  await requireSuperAdmin();
  const params = await searchParams;
  const search = params.search?.trim() ?? "";
  const role = params.role ?? "";
  const status = params.status ?? "";
  const publisherId = params.publisherId?.trim() ?? "";
  const libraryId = params.libraryId?.trim() ?? "";
  const result = await getUsers({
    page: Math.max(1, Number(params.page) || 1),
    limit: 20,
    search: search || undefined,
    role: role || undefined,
    isActive: status ? status === "active" : undefined,
    publisherId: publisherId || undefined,
    libraryId: libraryId || undefined,
  });
  const query = { search, role, status, publisherId, libraryId };
  return <div className="flex flex-col gap-6">
    <PageHeader title="Users" description="Manage access across every publisher and library." actions={<Link href="/users/new" className={buttonClassName()}>Add user</Link>} />
    <UsersFilters {...query} />
    {result.data.length ? <><UsersTable users={result.data} /><UsersPagination meta={result.meta} query={query} /></> :
      <EmptyState title="No matching users" description="Try changing the filters or create a new user." />}
  </div>;
}
