import type { ReactNode } from "react";
import Link from "next/link";

export function LedgerStack({
  title,
  href,
  meta,
  items,
}: {
  title: ReactNode;
  href?: string;
  meta?: ReactNode;
  items: Array<{ label: string; value: ReactNode }>;
}) {
  return (
    <article className="rounded-lg border border-border bg-card p-3">
      {href ? (
        <Link
          href={href}
          className="font-medium text-foreground hover:text-primary hover:underline"
        >
          {title}
        </Link>
      ) : (
        <p className="font-medium text-foreground">{title}</p>
      )}
      {meta ? <div className="mt-1">{meta}</div> : null}
      <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
        {items.map((item) => (
          <div key={item.label}>
            <dt className="text-xs text-muted-foreground">{item.label}</dt>
            <dd className="mt-0.5 tabular-nums text-foreground">{item.value}</dd>
          </div>
        ))}
      </dl>
    </article>
  );
}
