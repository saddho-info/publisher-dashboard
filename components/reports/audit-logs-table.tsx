import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { AuditLogRow, PaginationMeta } from "@/lib/reports/types";

function formatWhen(value: string): string {
  try {
    return new Intl.DateTimeFormat("en", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(value));
  } catch {
    return value;
  }
}

function actorLabel(row: AuditLogRow): string {
  if (!row.actor) return "—";
  return `${row.actor.firstName} ${row.actor.lastName}`.trim() || row.actor.email;
}

export function AuditLogsTable({ rows }: { rows: AuditLogRow[] }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>When</TableHead>
          <TableHead>Action</TableHead>
          <TableHead>Entity</TableHead>
          <TableHead>Actor</TableHead>
          <TableHead>Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((row) => (
          <TableRow key={row.id}>
            <TableCell className="whitespace-nowrap text-muted-foreground">
              {formatWhen(row.createdAt)}
            </TableCell>
            <TableCell>
              <p className="font-medium">{row.action}</p>
              <p className="text-xs text-muted-foreground">{row.method}</p>
            </TableCell>
            <TableCell>
              <p className="font-medium">{row.entityType}</p>
              <p className="font-mono text-xs text-muted-foreground">
                {row.entityId ?? "—"}
              </p>
            </TableCell>
            <TableCell>
              <p>{actorLabel(row)}</p>
              <p className="text-xs text-muted-foreground">
                {row.actor?.email ?? "system"}
              </p>
            </TableCell>
            <TableCell className="tabular-nums text-muted-foreground">
              {row.statusCode ?? "—"}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

export function AuditPagination({
  meta,
  query,
}: {
  meta: PaginationMeta;
  query: { search?: string; entityType?: string };
}) {
  if (meta.totalPages <= 1) return null;

  const prev = meta.page > 1 ? meta.page - 1 : null;
  const next = meta.page < meta.totalPages ? meta.page + 1 : null;

  function href(page: number) {
    const params = new URLSearchParams();
    params.set("page", String(page));
    if (query.search) params.set("search", query.search);
    if (query.entityType) params.set("entityType", query.entityType);
    return `/reports?${params.toString()}`;
  }

  return (
    <div className="flex items-center justify-between text-sm text-muted-foreground">
      <p>
        Page {meta.page} of {meta.totalPages} · {meta.total} events
      </p>
      <div className="flex gap-2">
        {prev ? (
          <Link href={href(prev)} className="hover:text-foreground">
            Previous
          </Link>
        ) : (
          <span className="opacity-40">Previous</span>
        )}
        {next ? (
          <Link href={href(next)} className="hover:text-foreground">
            Next
          </Link>
        ) : (
          <span className="opacity-40">Next</span>
        )}
      </div>
    </div>
  );
}
