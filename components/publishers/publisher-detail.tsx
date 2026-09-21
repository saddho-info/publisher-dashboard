import Link from "next/link";
import { PageHeader } from "@/components/dashboard/page-header";
import { Badge } from "@/components/ui/badge";
import { buttonClassName } from "@/components/ui/button-styles";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatCount, formatPublisherDate } from "@/lib/publishers/format";
import type { PublisherDetail } from "@/lib/publishers/types";

export function PublisherDetailView({
  publisher,
}: {
  publisher: PublisherDetail;
}) {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={publisher.name}
        description={publisher.email ?? `/${publisher.slug}`}
        actions={
          <Link
            href={`/publishers/${publisher.id}/edit`}
            className={buttonClassName({ variant: "outline" })}
          >
            Edit publisher
          </Link>
        }
      />

      <div className="flex flex-wrap items-center gap-2">
        <Badge variant={publisher.isActive ? "success" : "muted"}>
          {publisher.isActive ? "Active" : "Inactive"}
        </Badge>
        <span className="text-xs text-muted-foreground">/{publisher.slug}</span>
      </div>

      <section className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Contact</CardTitle>
            <CardDescription>
              Used for publisher staff accounts and organization profile.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <Field label="Email" value={publisher.email} />
            <Field label="Phone" value={publisher.phone} />
            <Field label="Address" value={publisher.address} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Organization</CardTitle>
            <CardDescription>
              Created {formatPublisherDate(publisher.createdAt)}. Staff can sign
              in once accounts are invited.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <Field label="Slug" value={publisher.slug} />
            <Field
              label="Staff accounts"
              value={formatCount(publisher._count.users)}
            />
            <Field
              label="Last updated"
              value={formatPublisherDate(publisher.updatedAt)}
            />
          </CardContent>
        </Card>
      </section>
    </div>
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
