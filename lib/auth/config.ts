function resolveApiUrl(): string {
  const candidates = [process.env.API_URL, process.env.NEXT_PUBLIC_API_URL];
  for (const value of candidates) {
    const trimmed = value?.trim();
    if (!trimmed) continue;
    // Avoid empty string after stripping a bare "/" (breaks fetch with relative paths).
    const normalized = trimmed.replace(/\/$/, "");
    if (!normalized) continue;
    if (!/^https?:\/\//i.test(normalized)) {
      throw new Error(
        `API_URL must be an absolute http(s) URL (got "${trimmed}"). Set API_URL / NEXT_PUBLIC_API_URL on Vercel to https://pubtrack-backend.vercel.app`,
      );
    }
    return normalized;
  }

  if (process.env.VERCEL || process.env.NODE_ENV === "production") {
    throw new Error(
      "API_URL is not set. Add API_URL=https://pubtrack-backend.vercel.app (and NEXT_PUBLIC_API_URL) in the publisher-dashboard Vercel project env vars.",
    );
  }

  return "http://localhost:3000";
}

export const API_URL = resolveApiUrl();

export const ACCESS_COOKIE = "pt_pub_access";
export const REFRESH_COOKIE = "pt_pub_refresh";

export const PUBLISHER_ROLES = [
  "SUPER_ADMIN",
  "PUBLISHER_ADMIN",
  "PUBLISHER_STAFF",
] as const;

export type PublisherRole = (typeof PUBLISHER_ROLES)[number];

export function isAllowedPublisherRole(role: string): role is PublisherRole {
  return (PUBLISHER_ROLES as readonly string[]).includes(role);
}
