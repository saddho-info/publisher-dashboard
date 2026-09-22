"use client";

import Link from "next/link";
import { useActionState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { setUserActiveAction } from "@/lib/users/actions";
import { USER_ROLES, type FormState, type LibraryUser, type PaginationMeta } from "@/lib/users/types";

const roleOptions = USER_ROLES.map((role) => ({
  value: role,
  label: role.replaceAll("_", " ").toLowerCase(),
}));

export function UsersFilters(props: {
  search: string;
  role: string;
  status: string;
  publisherId: string;
  libraryId: string;
}) {
  return (
    <form method="get" className="grid gap-3 rounded-lg border bg-card p-4 md:grid-cols-5">
      <Input name="search" label="Search" defaultValue={props.search} placeholder="Name or email" />
      <Select name="role" label="Role" defaultValue={props.role} options={[{ value: "", label: "All roles" }, ...roleOptions]} />
      <Select name="status" label="Status" defaultValue={props.status} options={[
        { value: "", label: "All statuses" },
        { value: "active", label: "Active" },
        { value: "inactive", label: "Inactive" },
      ]} />
      <Input name="publisherId" label="Publisher ID" defaultValue={props.publisherId} />
      <Input name="libraryId" label="Library ID" defaultValue={props.libraryId} />
      <div className="md:col-span-5"><Button type="submit" variant="secondary">Apply filters</Button></div>
    </form>
  );
}

export function UsersTable({ users }: { users: LibraryUser[] }) {
  return (
    <Table>
      <TableHeader><TableRow>
        <TableHead>User</TableHead><TableHead>Role</TableHead><TableHead>Organization</TableHead>
        <TableHead>Status</TableHead><TableHead>Actions</TableHead>
      </TableRow></TableHeader>
      <TableBody>{users.map((user) => (
        <TableRow key={user.id}>
          <TableCell><p className="font-medium">{user.firstName} {user.lastName}</p><p className="text-xs text-muted-foreground">{user.email}</p></TableCell>
          <TableCell>{user.role.replaceAll("_", " ")}</TableCell>
          <TableCell className="font-mono text-xs text-muted-foreground">{user.publisherId ?? user.libraryId ?? "Platform"}</TableCell>
          <TableCell><Badge variant={user.isActive ? "success" : "muted"}>{user.isActive ? "Active" : "Inactive"}</Badge></TableCell>
          <TableCell><div className="flex items-center gap-3">
            <Link href={`/users/${user.id}/edit`} className="text-sm font-medium hover:underline">Edit</Link>
            <form action={setUserActiveAction.bind(null, user.id, !user.isActive)}>
              <Button type="submit" size="sm" variant="outline">{user.isActive ? "Deactivate" : "Activate"}</Button>
            </form>
          </div></TableCell>
        </TableRow>
      ))}</TableBody>
    </Table>
  );
}

export function UsersPagination({ meta, query }: { meta: PaginationMeta; query: Record<string, string> }) {
  if (meta.totalPages <= 1) return null;
  const href = (page: number) => {
    const params = new URLSearchParams(query);
    params.set("page", String(page));
    return `/users?${params}`;
  };
  return <nav className="flex justify-between text-sm text-muted-foreground">
    <span>Page {meta.page} of {meta.totalPages} · {meta.total} users</span>
    <span className="flex gap-3">
      {meta.page > 1 ? <Link href={href(meta.page - 1)}>Previous</Link> : <span className="opacity-40">Previous</span>}
      {meta.page < meta.totalPages ? <Link href={href(meta.page + 1)}>Next</Link> : <span className="opacity-40">Next</span>}
    </span>
  </nav>;
}

export function UserForm({ action, user }: {
  action: (state: FormState, formData: FormData) => Promise<FormState>;
  user?: LibraryUser;
}) {
  const [state, formAction, pending] = useActionState(action, {});
  const errors = state.fieldErrors ?? {};
  return <form action={formAction} className="flex max-w-2xl flex-col gap-4">
    {state.error ? <p role="alert" className="rounded-md border border-destructive/20 bg-destructive/5 p-3 text-sm text-destructive">{state.error}</p> : null}
    <div className="grid gap-4 sm:grid-cols-2">
      <Input name="firstName" label="First name" required defaultValue={user?.firstName} error={errors.firstName} />
      <Input name="lastName" label="Last name" required defaultValue={user?.lastName} error={errors.lastName} />
    </div>
    <Input name="email" type="email" label="Email" required defaultValue={user?.email} error={errors.email} />
    <Input name="password" type="password" label={user ? "New password" : "Temporary password"} required={!user} hint={user ? "Leave blank to keep the current password." : "At least 8 characters."} error={errors.password} />
    <Select name="role" label="Role" required defaultValue={user?.role ?? "PUBLISHER_STAFF"} options={roleOptions} error={errors.role} />
    <div className="grid gap-4 sm:grid-cols-2">
      <Input name="publisherId" label="Publisher ID" defaultValue={user?.publisherId ?? ""} hint="Required for publisher roles." />
      <Input name="libraryId" label="Library ID" defaultValue={user?.libraryId ?? ""} hint="Required for library roles." />
    </div>
    <label className="flex items-center gap-2 text-sm font-medium"><input type="checkbox" name="isActive" defaultChecked={user?.isActive ?? true} className="size-4" />Active user</label>
    <div className="flex gap-2"><Button type="submit" loading={pending}>{user ? "Save user" : "Create user"}</Button><Link href="/users" className="px-3 py-2 text-sm text-muted-foreground">Cancel</Link></div>
  </form>;
}
