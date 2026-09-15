import { Suspense } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { LoginForm } from "./login-form";

export default function LoginPage() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-6 py-16">
      <Card className="w-full max-w-md">
        <CardHeader>
          <p className="text-xs font-semibold tracking-[0.16em] text-primary uppercase">
            PubTrack
          </p>
          <CardTitle className="text-2xl">Publisher sign in</CardTitle>
          <CardDescription>
            Use your publisher account to manage catalog, inventory, and
            distribution.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Suspense>
            <LoginForm />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  );
}
