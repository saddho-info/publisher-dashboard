import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatLibraryPortalRole, type LibraryUser } from "@/lib/users/types";

export function LibraryPortalUsersTable({
  users,
  libraryId,
}: {
  users: LibraryUser[];
  libraryId: string;
}) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Role</TableHead>
          <TableHead>Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {users.map((user) => (
          <TableRow key={user.id}>
            <TableCell>
              <Link
                href={`/libraries/${libraryId}/staff/${user.id}/edit`}
                className="font-medium text-foreground hover:text-primary hover:underline"
              >
                {user.firstName} {user.lastName}
              </Link>
            </TableCell>
            <TableCell className="text-muted-foreground">{user.email}</TableCell>
            <TableCell>{formatLibraryPortalRole(user.role)}</TableCell>
            <TableCell>
              <Badge variant={user.isActive ? "success" : "muted"}>
                {user.isActive ? "Active" : "Inactive"}
              </Badge>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
