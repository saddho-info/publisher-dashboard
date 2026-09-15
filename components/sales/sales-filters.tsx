import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import type { LibraryListItem } from "@/lib/libraries/types";

export function SalesFilters({
  search,
  libraryId,
  libraries,
}: {
  search: string;
  libraryId: string;
  libraries: LibraryListItem[];
}) {
  return (
    <form method="get" className="flex flex-col gap-2 sm:flex-row sm:items-end">
      <div className="min-w-0 flex-1">
        <Input
          name="search"
          label="Search"
          placeholder="Code, title, ISBN, or notes"
          defaultValue={search}
        />
      </div>
      <Select
        name="libraryId"
        label="Library"
        defaultValue={libraryId}
        className="sm:w-56"
        options={[
          { value: "", label: "All libraries" },
          ...libraries.map((library) => ({
            value: library.id,
            label: library.name,
          })),
        ]}
      />
      <Button type="submit" variant="secondary">
        Filter
      </Button>
    </form>
  );
}
