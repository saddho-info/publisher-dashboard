import type { Metadata } from "next";
import { PageHeader } from "@/components/dashboard/page-header";
import { UserForm } from "@/components/users/user-management";
import { requireSuperAdmin } from "@/lib/auth/roles";
import { createUserAction } from "@/lib/users/actions";

export const metadata: Metadata = { title: "Add user" };

export default async function NewUserPage() {
  await requireSuperAdmin();
  return <div className="flex flex-col gap-6">
    <PageHeader title="Add user" description="Create a platform, publisher, or library account." />
    <UserForm action={createUserAction} />
  </div>;
}
