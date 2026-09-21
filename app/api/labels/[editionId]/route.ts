import { NextRequest, NextResponse } from "next/server";
import { apiServerFetch, readApiError } from "@/lib/api/server";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ editionId: string }> },
) {
  const { editionId } = await context.params;
  const upstream = await apiServerFetch(
    `/api/v1/labels/${encodeURIComponent(editionId)}.pdf${request.nextUrl.search}`,
  );

  if (!upstream.ok) {
    return NextResponse.json(
      { message: await readApiError(upstream) },
      { status: upstream.status },
    );
  }

  const headers = new Headers();
  headers.set(
    "Content-Type",
    upstream.headers.get("content-type") ?? "application/pdf",
  );
  const disposition = upstream.headers.get("content-disposition");
  if (disposition) headers.set("Content-Disposition", disposition);

  return new NextResponse(upstream.body, {
    status: 200,
    headers,
  });
}
