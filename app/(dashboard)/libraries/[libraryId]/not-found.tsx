import Link from "next/link";
import { buttonClassName } from "@/components/ui/button-styles";
import { EmptyState } from "@/components/ui/empty-state";

export default function LibraryNotFound() {
  return (
    <EmptyState
      title="Library not found"
      description="This library is missing, or it is not linked to your publisher."
      action={
        <Link
          href="/libraries"
          className={buttonClassName({ variant: "outline" })}
        >
          Back to libraries
        </Link>
      }
    />
  );
}
