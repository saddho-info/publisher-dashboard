import type { Metadata } from "next";
import { PageHeader } from "@/components/dashboard/page-header";
import { UserForm } from "@/components/users/user-management";
import { requireSuperAdmin } from "@/lib/auth/roles";
import { updateUserAction } from "@/lib/users/actions";
import { getLibraryUser } from "@/lib/users/get-users";

export const metadata: Metadata = { title: "Edit user" };

export default async function EditUserPage({ params }: { params: Promise<{ userId: string }> }) {
  await requireSuperAdmin();
  const { userId } = await params;
  const user = await getLibraryUser(userId);
  return <div className="flex flex-col gap-6">
    <PageHeader title="Edit user" description={`Update ${user.email}.`} />
    <UserForm action={updateUserAction.bind(null, user.id)} user={user} />
  </div>;
}
