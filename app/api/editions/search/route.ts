import { unstable_rethrow } from "next/navigation";
import { NextResponse, type NextRequest } from "next/server";
import { ApiError } from "@/lib/api/server";
import { MIN_EDITION_SEARCH_LENGTH } from "@/lib/edition-performance/constants";
import { searchEditions } from "@/lib/edition-performance/get-edition-performance";

export async function GET(request: NextRequest) {
  const search = request.nextUrl.searchParams.get("search")?.trim() ?? "";
  if (search.length < MIN_EDITION_SEARCH_LENGTH) {
    return NextResponse.json(
      {
        message: `Enter at least ${MIN_EDITION_SEARCH_LENGTH} characters to search editions.`,
      },
      { status: 400 },
    );
  }

  try {
    return NextResponse.json(await searchEditions(search));
  } catch (error) {
    unstable_rethrow(error);
    if (error instanceof ApiError) {
      return NextResponse.json(
        { message: error.message },
        { status: error.status },
      );
    }
    return NextResponse.json(
      { message: "Edition search is unavailable right now." },
      { status: 502 },
    );
  }
}
