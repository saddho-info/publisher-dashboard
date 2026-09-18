import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";

export function AuditFilters({
  search,
  entityType,
}: {
  search: string;
  entityType: string;
}) {
  return (
    <form method="get" className="flex flex-col gap-2 sm:flex-row sm:items-end">
      <div className="min-w-0 flex-1">
        <Input
          name="search"
          label="Search"
          placeholder="Path, action, or entity id"
          defaultValue={search}
        />
      </div>
      <Select
        name="entityType"
        label="Entity"
        defaultValue={entityType}
        className="sm:w-56"
        options={[
          { value: "", label: "All entities" },
          { value: "Sale", label: "Sale" },
          { value: "Distribution", label: "Distribution" },
          { value: "StockReceipt", label: "Stock receipt" },
          { value: "BookCopy", label: "Book copy" },
          { value: "Inventory", label: "Inventory" },
          { value: "SyncTransaction", label: "Sync" },
        ]}
      />
      <Button type="submit" variant="secondary">
        Filter
      </Button>
    </form>
  );
}
