"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { Button } from "@/components/ui/button";

export function RetryReportButton() {
  const router = useRouter();
  const [isRetrying, startRetry] = useTransition();

  return (
    <Button
      variant="outline"
      loading={isRetrying}
      onClick={() => startRetry(() => router.refresh())}
    >
      Try again
    </Button>
  );
}
