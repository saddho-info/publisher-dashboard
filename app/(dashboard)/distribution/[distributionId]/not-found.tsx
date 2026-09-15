import Link from "next/link";
import { buttonClassName } from "@/components/ui/button-styles";
import { EmptyState } from "@/components/ui/empty-state";

export default function DistributionNotFound() {
  return (
    <EmptyState
      title="Shipment not found"
      description="This shipment is missing, or it belongs to another publisher."
      action={
        <Link
          href="/distribution"
          className={buttonClassName({ variant: "outline" })}
        >
          Back to distribution
        </Link>
      }
    />
  );
}
