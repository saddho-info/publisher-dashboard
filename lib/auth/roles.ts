import { redirect } from "next/navigation";
import { requirePublisherSession } from "@/lib/auth/session";
import type { PublicUser } from "@/lib/auth/types";

export function isSuperAdmin(role: string): boolean {
  return role === "SUPER_ADMIN";
}

export async function requireSuperAdmin(): Promise<PublicUser> {
  const user = await requirePublisherSession();
  if (!isSuperAdmin(user.role)) {
    redirect("/dashboard");
  }
  return user;
}
