import Link from "next/link";
import { buttonClassName } from "@/components/ui/button-styles";
import { EmptyState } from "@/components/ui/empty-state";

export default function PublisherNotFound() {
  return (
    <EmptyState
      title="Publisher not found"
      description="This publisher is missing, or you do not have access to it."
      action={
        <Link
          href="/publishers"
          className={buttonClassName({ variant: "outline" })}
        >
          Back to publishers
        </Link>
      }
    />
  );
}
