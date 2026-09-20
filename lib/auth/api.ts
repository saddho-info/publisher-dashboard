import { API_URL } from "./config";
import type { AuthTokens, PublicUser } from "./types";

export async function loginRequest(
  email: string,
  password: string,
): Promise<AuthTokens> {
  const response = await fetch(`${API_URL}/api/v1/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  return parseAuthResponse(response);
}

export async function refreshRequest(refreshToken: string): Promise<AuthTokens> {
  const response = await fetch(`${API_URL}/api/v1/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refreshToken }),
  });
  return parseAuthResponse(response);
}

export async function logoutRequest(input: {
  accessToken?: string;
  refreshToken?: string;
}): Promise<void> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (input.accessToken) {
    headers.Authorization = `Bearer ${input.accessToken}`;
  }
  await fetch(`${API_URL}/api/v1/auth/logout`, {
    method: "POST",
    headers,
    body: JSON.stringify({ refreshToken: input.refreshToken }),
  });
}

export async function meRequest(accessToken: string): Promise<PublicUser> {
  const response = await fetch(`${API_URL}/api/v1/auth/me`, {
    headers: { Authorization: `Bearer ${accessToken}` },
    cache: "no-store",
  });
  if (!response.ok) {
    throw new Error("Unauthorized");
  }
  return (await response.json()) as PublicUser;
}

async function parseAuthResponse(response: Response): Promise<AuthTokens> {
  const rawText = await response.text();
  let body: {
    message?: string | string[];
  } & Partial<AuthTokens> = {};
  try {
    body = rawText ? (JSON.parse(rawText) as typeof body) : {};
  } catch {
    body = {};
  }

  if (!response.ok) {
    const fromJson = Array.isArray(body.message)
      ? body.message.join(" ")
      : body.message;
    const fromText =
      /FUNCTION_INVOCATION_FAILED/i.test(rawText)
        ? "Backend is down (Vercel FUNCTION_INVOCATION_FAILED). Check pubtrack-backend logs and env vars (DATABASE_URL, REDIS_URL), then redeploy."
        : rawText.trim().slice(0, 200) || undefined;
    throw new Error(fromJson ?? fromText ?? "Unable to sign in");
  }

  if (!body.accessToken || !body.refreshToken || !body.user) {
    throw new Error("Invalid auth response");
  }

  return body as AuthTokens;
}
