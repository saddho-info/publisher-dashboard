import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { buttonClassName } from "@/components/ui/button-styles";
import { reportDownloadHref } from "@/lib/reports/get-reports";
import type { ReportExport } from "@/lib/reports/types";

const PUBLISHER_EXPORTS: ReportExport[] = [
  {
    kind: "sales.csv",
    label: "Sales CSV",
    description: "Line-level sales of your editions across partner libraries.",
  },
  {
    kind: "sales.pdf",
    label: "Sales PDF",
    description: "Printable sales summary for the current scope.",
  },
  {
    kind: "inventory.csv",
    label: "Inventory CSV",
    description: "Warehouse, library, in-transit, and sold counts by edition.",
  },
  {
    kind: "inventory.pdf",
    label: "Inventory PDF",
    description: "Printable inventory rollup.",
  },
  {
    kind: "audit-logs.csv",
    label: "Audit CSV",
    description: "Inventory-mutating actions by your publisher staff.",
  },
  {
    kind: "audit-logs.pdf",
    label: "Audit PDF",
    description: "Printable audit trail excerpt.",
  },
];

export function ReportExportCards() {
  return (
    <section
      aria-label="Export reports"
      className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3"
    >
      {PUBLISHER_EXPORTS.map((item) => (
        <Card key={item.kind}>
          <CardHeader>
            <CardTitle>{item.label}</CardTitle>
            <CardDescription>{item.description}</CardDescription>
          </CardHeader>
          <CardContent>
            <Link
              href={reportDownloadHref(item.kind)}
              className={buttonClassName({ variant: "outline", size: "sm" })}
              prefetch={false}
            >
              Download
            </Link>
          </CardContent>
        </Card>
      ))}
    </section>
  );
}
