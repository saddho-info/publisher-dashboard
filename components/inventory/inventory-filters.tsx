import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";

export function InventoryFilters({
  search,
  stock,
}: {
  search: string;
  stock: string;
}) {
  return (
    <form method="get" className="flex flex-col gap-2 sm:flex-row sm:items-end">
      <div className="min-w-0 flex-1">
        <Input
          name="search"
          label="Search"
          placeholder="Title, author, or ISBN"
          defaultValue={search}
        />
      </div>
      <Select
        name="stock"
        label="Stock"
        defaultValue={stock}
        className="sm:w-44"
        options={[
          { value: "all", label: "All editions" },
          { value: "low", label: "Low stock" },
        ]}
      />
      <Button type="submit" variant="secondary">
        Filter
      </Button>
    </form>
  );
}
