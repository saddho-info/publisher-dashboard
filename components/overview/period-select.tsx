"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Select } from "@/components/ui/select";
import { PERIOD_OPTIONS } from "@/lib/overview/questions";
import type { OverviewPeriod } from "@/lib/overview/types";

export function PeriodSelect({ value }: { value: OverviewPeriod }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  return (
    <Select
      aria-label="Reporting period"
      size="sm"
      value={value}
      className="w-40"
      onChange={(event) => {
        const next = new URLSearchParams(searchParams.toString());
        next.set("period", event.target.value);
        const query = next.toString();
        router.replace(query ? `${pathname}?${query}` : pathname);
      }}
      options={PERIOD_OPTIONS.map((option) => ({
        value: option.value,
        label: option.label,
      }))}
    />
  );
}
