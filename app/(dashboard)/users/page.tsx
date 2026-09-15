import type { Metadata } from "next";
import { SectionStub } from "@/components/dashboard/section-stub";

export const metadata: Metadata = {
  title: "Users",
};

export default function UsersPage() {
  return <SectionStub href="/users" />;
}
