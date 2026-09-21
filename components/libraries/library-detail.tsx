import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { buttonClassName } from "@/components/ui/button-styles";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PageHeader } from "@/components/dashboard/page-header";
import { LibraryPortalAccess } from "@/components/libraries/library-portal-access";
import { PartnershipForm } from "./partnership-form";
import { UnlinkLibraryButton } from "./unlink-library-button";
import { formatCount, formatLinkedDate } from "@/lib/libraries/format";
import {
  canManageLibraries,
  type LibraryDetail,
} from "@/lib/libraries/types";
import { canWriteDistributions } from "@/lib/distribution/types";
import {
  canManageLibraryPortalAccess,
  type LibraryUser,
} from "@/lib/users/types";

export function LibraryDetailView({
  library,
  role,
  portalUsers = [],
}: {
  library: LibraryDetail;
  role: string;
  portalUsers?: LibraryUser[];
}) {
  const canManage = canManageLibraries(role);
  const canDistribute = canWriteDistributions(role);
  const canManagePortal = canManageLibraryPortalAccess(role);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={library.name}
        description={library.email ?? `/${library.slug}`}
        actions={
          canManage || canDistribute || canManagePortal ? (
            <div className="flex flex-wrap gap-2">
              {canManage ? (
                <Link
                  href={`/libraries/${library.id}/edit`}
                  className={buttonClassName({ variant: "outline" })}
                >
                  Edit details
                </Link>
              ) : null}
              {canManagePortal ? (
                <Link
                  href={`/libraries/${library.id}/staff/new`}
                  className={buttonClassName({ variant: "outline" })}
                >
                  Add portal account
                </Link>
              ) : null}
              {canDistribute ? (
                <Link
                  href={`/distribution/new?libraryId=${library.id}`}
                  className={buttonClassName()}
                >
                  Distribute stock
                </Link>
              ) : null}
            </div>
          ) : null
        }
      />

      <div className="flex flex-wrap items-center gap-2">
        <Badge variant={library.isActive ? "success" : "muted"}>
          {library.isActive ? "Active" : "Inactive"}
        </Badge>
        {library.link ? (
          <Badge variant={library.link.isActive ? "brand" : "warning"}>
            {library.link.isActive ? "Partnership active" : "Partnership paused"}
          </Badge>
        ) : null}
        <span className="text-xs text-muted-foreground">/{library.slug}</span>
      </div>

      <section aria-label="Stock at this library">
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <StockCard
            label="On hand"
            value={library.stock.onHand}
            hint="Copies received and still held"
          />
          <StockCard
            label="In transit"
            value={library.stock.inTransit}
            hint="Distributed, not yet received"
          />
          <StockCard
            label="Sold"
            value={library.stock.sold}
            hint="Confirmed unit sales"
          />
          <StockCard
            label="Copies"
            value={library.stock.copyCount}
            hint="Physical units assigned here"
          />
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(16rem,1fr)]">
        <Card>
          <CardHeader>
            <CardTitle>Contact</CardTitle>
            <CardDescription>
              Used when allocating distribution and for library staff login.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <Field label="Email" value={library.email} />
            <Field label="Phone" value={library.phone} />
            <Field label="Address" value={library.address} />
            <Field
              label="Staff accounts"
              value={formatCount(library._count.users)}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Partnership</CardTitle>
            <CardDescription>
              Linked {formatLinkedDate(library.link?.createdAt)}. Use Distribute
              stock to allocate warehouse copies to this library.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {canManage && library.link ? (
              <PartnershipForm library={library} />
            ) : (
              <p className="text-sm text-muted-foreground">
                {library.link?.notes || "No notes on this partnership."}
              </p>
            )}
            {canManage ? (
              <UnlinkLibraryButton
                libraryId={library.id}
                libraryName={library.name}
                publisherId={
                  role === "SUPER_ADMIN"
                    ? (library.link?.publisherId ?? undefined)
                    : undefined
                }
              />
            ) : null}
          </CardContent>
        </Card>
      </section>

      {canManagePortal ? (
        <LibraryPortalAccess libraryId={library.id} users={portalUsers} />
      ) : null}
    </div>
  );
}

function StockCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: number;
  hint: string;
}) {
  return (
    <Card>
      <CardHeader>
        <CardDescription>{label}</CardDescription>
        <CardTitle className="text-2xl tabular-nums">
          {formatCount(value)}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <p className="text-xs text-muted-foreground">{hint}</p>
      </CardContent>
    </Card>
  );
}

function Field({ label, value }: { label: string; value: string | null }) {
  return (
    <div>
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <p className="mt-0.5 text-foreground">
        {value && value.length > 0 ? value : "—"}
      </p>
    </div>
  );
}
