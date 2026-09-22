"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";
import { formatMoney } from "@/lib/books/format";
import {
  EDITION_PERFORMANCE_PATH,
  EDITION_SEARCH_INPUT_ID,
} from "@/lib/edition-performance/constants";
import { selectedEditionDetail } from "@/lib/edition-performance/format";
import type {
  EditionPerformanceBook,
  EditionPerformanceEdition,
} from "@/lib/edition-performance/types";

export function SelectedEditionSummary({
  book,
  edition,
}: {
  book: EditionPerformanceBook;
  edition: EditionPerformanceEdition;
}) {
  const router = useRouter();
  const [isClearing, startClearing] = useTransition();

  function clearSelection() {
    startClearing(() => {
      router.push(EDITION_PERFORMANCE_PATH);
    });
    document.getElementById(EDITION_SEARCH_INPUT_ID)?.focus();
  }

  return (
    <Card>
      <CardHeader className="sm:flex-row sm:items-start sm:justify-between sm:gap-4">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-base font-semibold tracking-tight text-foreground">
              {book.title}
            </h2>
            <Badge variant="outline">Selected edition</Badge>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            {selectedEditionDetail(edition, book.authors)}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            List price{" "}
            <span className="tabular-nums">
              {formatMoney(edition.listPriceCents, edition.currency)}
            </span>
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={clearSelection}
          loading={isClearing}
        >
          Change edition
        </Button>
      </CardHeader>
    </Card>
  );
}
