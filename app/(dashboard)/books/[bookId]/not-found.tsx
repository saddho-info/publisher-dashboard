import Link from "next/link";
import { buttonClassName } from "@/components/ui/button-styles";
import { EmptyState } from "@/components/ui/empty-state";

export default function BookNotFound() {
  return (
    <EmptyState
      title="Book not found"
      description="This title is missing, or you do not have access to it."
      action={
        <Link href="/books" className={buttonClassName({ variant: "outline" })}>
          Back to books
        </Link>
      }
    />
  );
}
