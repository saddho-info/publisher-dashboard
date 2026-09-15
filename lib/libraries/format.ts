import { formatCount } from "@/lib/inventory/format";

export { formatCount };

export function formatLinkedDate(iso: string | null | undefined): string {
  if (!iso) {
    return "—";
  }
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return iso;
  }
  return new Intl.DateTimeFormat("en-US", { dateStyle: "medium" }).format(date);
}
