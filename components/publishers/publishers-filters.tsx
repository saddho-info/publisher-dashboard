import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";

export function PublishersFilters({
  search,
  isActive,
}: {
  search: string;
  isActive: string;
}) {
  return (
    <form method="get" className="flex flex-col gap-2 sm:flex-row sm:items-end">
      <div className="min-w-0 flex-1">
        <Input
          name="search"
          label="Search"
          placeholder="Name or slug"
          defaultValue={search}
        />
      </div>
      <Select
        name="isActive"
        label="Status"
        defaultValue={isActive}
        className="sm:w-40"
        options={[
          { value: "true", label: "Active" },
          { value: "false", label: "Inactive" },
          { value: "all", label: "All" },
        ]}
      />
      <Button type="submit" variant="secondary">
        Filter
      </Button>
    </form>
  );
}
