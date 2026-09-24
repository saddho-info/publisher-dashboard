import { formatMoney } from "@/lib/books/format";
import { hasRevenue, NO_VALUE } from "@/lib/libraries/format";
import type { LibraryRevenue } from "@/lib/libraries/types";

export function StackedRevenue({
  revenue,
  align = "end",
}: {
  revenue: LibraryRevenue[] | undefined;
  align?: "start" | "end";
}) {
  if (!hasRevenue(revenue)) {
    return <span className="tabular-nums">{NO_VALUE}</span>;
  }

  return (
    <span
      className={
        align === "end"
          ? "flex flex-col items-end tabular-nums"
          : "flex flex-col items-start tabular-nums"
      }
    >
      {revenue.map((entry) => (
        <span key={entry.currency}>
          {formatMoney(entry.totalCents, entry.currency)}
        </span>
      ))}
    </span>
  );
}
