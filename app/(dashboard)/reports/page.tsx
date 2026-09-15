import type { Metadata } from "next";
import { SectionStub } from "@/components/dashboard/section-stub";

export const metadata: Metadata = {
  title: "Reports",
};

export default function ReportsPage() {
  return <SectionStub href="/reports" />;
}
