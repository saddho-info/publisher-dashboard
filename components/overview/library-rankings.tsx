import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import {
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { LibrariesIcon } from "@/components/dashboard/icons";
import { formatCount, formatPercent, shareOf } from "@/lib/overview/format";
import type { OverviewLibraryRank } from "@/lib/overview/types";

export function LibraryRankings({
  libraries,
}: {
  libraries: OverviewLibraryRank[];
}) {
  const totalSold = libraries.reduce((sum, row) => sum + row.sold, 0);

  return (
    <Card className="overflow-hidden">
      <CardHeader>
        <CardTitle>Fastest-selling libraries</CardTitle>
        <CardDescription>
          Which libraries sell fastest? Ranked by confirmed sales in this period.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {libraries.length === 0 ? (
          <EmptyState
            className="border-0 bg-muted/40 py-10 shadow-none"
            title="No library rankings yet"
            description="Rankings appear after partner libraries record sales."
            icon={<LibrariesIcon className="size-6 text-muted-foreground" />}
            action={
              <Link
                href="/libraries"
                className="text-xs font-medium text-primary hover:underline"
              >
                Manage libraries
              </Link>
            }
          />
        ) : (
          <div className="relative w-full overflow-x-auto">
            <table className="w-full caption-bottom text-sm">
              <TableHeader>
                <TableRow>
                  <TableHead className="w-10">#</TableHead>
                  <TableHead>Library</TableHead>
                  <TableHead className="text-right">Sold</TableHead>
                  <TableHead className="text-right">Share</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {libraries.map((row, index) => (
                  <TableRow key={row.libraryId}>
                    <TableCell className="tabular-nums text-muted-foreground">
                      {index + 1}
                    </TableCell>
                    <TableCell className="font-medium">{row.name}</TableCell>
                    <TableCell className="text-right tabular-nums">
                      {formatCount(row.sold)}
                    </TableCell>
                    <TableCell className="text-right tabular-nums text-muted-foreground">
                      {formatPercent(shareOf(row.sold, totalSold))}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </table>
          </div>
        )}
      </CardContent>
      {libraries.length > 0 ? (
        <CardFooter>
          <Link
            href="/libraries"
            className="text-xs font-medium text-primary hover:underline"
          >
            View libraries
          </Link>
        </CardFooter>
      ) : null}
    </Card>
  );
}
