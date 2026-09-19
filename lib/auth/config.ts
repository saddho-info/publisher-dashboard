function resolveApiUrl(): string {
  const candidates = [process.env.API_URL, process.env.NEXT_PUBLIC_API_URL];
  for (const value of candidates) {
    const trimmed = value?.trim();
    if (trimmed) return trimmed.replace(/\/$/, "");
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
