import type { Metadata } from "next";
import { SectionStub } from "@/components/dashboard/section-stub";

export const metadata: Metadata = {
  title: "Settings",
};

export default function SettingsPage() {
  return <SectionStub href="/settings" />;
}
