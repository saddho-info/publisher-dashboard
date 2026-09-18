export type AuditActor = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
};

export type AuditLogRow = {
  id: string;
  actorUserId: string | null;
  action: string;
  entityType: string;
  entityId: string | null;
  method: string;
  path: string;
  statusCode: number | null;
  metadata: unknown;
  ip: string | null;
  createdAt: string;
  actor: AuditActor | null;
};

export type PaginationMeta = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export type AuditLogListResult = {
  data: AuditLogRow[];
  meta: PaginationMeta;
};

export type ReportKind =
  | "sales.csv"
  | "sales.pdf"
  | "inventory.csv"
  | "inventory.pdf"
  | "receipts.csv"
  | "receipts.pdf"
  | "audit-logs.csv"
  | "audit-logs.pdf";

export type ReportExport = {
  kind: ReportKind;
  label: string;
  description: string;
};
