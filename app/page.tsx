import { redirect } from "next/navigation";
import { DEFAULT_AFTER_LOGIN } from "@/lib/auth/paths";

export default function Home() {
  redirect(DEFAULT_AFTER_LOGIN);
}
