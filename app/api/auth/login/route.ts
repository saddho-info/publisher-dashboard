import { NextResponse } from "next/server";
import { loginRequest } from "@/lib/auth/api";
import { isAllowedPublisherRole } from "@/lib/auth/config";
import { clearAuthCookies, setAuthCookies } from "@/lib/auth/cookies";

export async function POST(request: Request) {
  const body = (await request.json()) as { email?: string; password?: string };
  if (!body.email || !body.password) {
    return NextResponse.json(
      { message: "Email and password are required" },
      { status: 400 },
    );
  }

  try {
    const tokens = await loginRequest(body.email, body.password);
    if (!isAllowedPublisherRole(tokens.user.role)) {
      const response = NextResponse.json(
        {
          message:
            "This account cannot access the Publisher Dashboard. Use the Library Portal instead.",
        },
        { status: 403 },
      );
      clearAuthCookies(response);
      return response;
    }

    const response = NextResponse.json({ user: tokens.user });
    setAuthCookies(response, tokens);
    return response;
  } catch (error) {
    const raw =
      error instanceof Error ? error.message : "Unable to sign in";
    // Node fetch throws this when API_URL is missing/empty and the URL is relative.
    const message = raw.includes("Failed to parse URL")
      ? "Backend API_URL is not configured. Set API_URL and NEXT_PUBLIC_API_URL on Vercel to the Nest backend origin (e.g. https://pubtrack-backend.vercel.app)."
      : raw;
    const status = message.toLowerCase().includes("invalid") ? 401 : 400;
    return NextResponse.json({ message }, { status });
  }
}
