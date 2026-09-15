import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { COPY_STATUSES } from "@/lib/inventory/types";
import { formatCopyStatus } from "@/lib/inventory/format";

export function CopyFilters({
  status,
  pathname,
}: {
  status: string;
  pathname: string;
}) {
  return (
    <form method="get" action={pathname} className="flex flex-col gap-2 sm:flex-row sm:items-end">
      <Select
        name="status"
        label="Copy status"
        defaultValue={status}
        className="sm:w-52"
        options={[
          { value: "all", label: "All statuses" },
          ...COPY_STATUSES.map((value) => ({
            value,
            label: formatCopyStatus(value),
          })),
        ]}
      />
      <Button type="submit" variant="secondary">
        Filter
      </Button>
    </form>
  );
}
