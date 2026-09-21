import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { buttonClassName } from "@/components/ui/button-styles";
import { LibraryPortalUsersTable } from "@/components/libraries/library-portal-users-table";
import type { LibraryUser } from "@/lib/users/types";

export function LibraryPortalAccess({
  libraryId,
  users,
}: {
  libraryId: string;
  users: LibraryUser[];
}) {
  return (
    <Card>
      <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <CardTitle>Portal access</CardTitle>
          <CardDescription>
            Library admin and staff accounts that can sign in to the Library
            Portal. Create a temporary password and share it with the contact.
          </CardDescription>
        </div>
        <Link
          href={`/libraries/${libraryId}/staff/new`}
          className={buttonClassName()}
        >
          Add portal account
        </Link>
      </CardHeader>
      <CardContent>
        {users.length === 0 ? (
          <EmptyState
            title="No portal accounts"
            description="Add a library admin so this library can receive stock and record sales in the portal."
            action={
              <Link
                href={`/libraries/${libraryId}/staff/new`}
                className={buttonClassName({ variant: "outline" })}
              >
                Add library admin
              </Link>
            }
          />
        ) : (
          <LibraryPortalUsersTable users={users} libraryId={libraryId} />
        )}
      </CardContent>
    </Card>
  );
}
