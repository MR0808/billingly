"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "@/lib/auth/auth-client";
import { Button } from "@/components/ui/button";

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setPending(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    const res = await signIn.email({
      email,
      password,
    });

    setPending(false);

    if (res.error) {
      setError(res.error.message ?? "Invalid credentials.");
      return;
    }

    router.push("/app");
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-full max-w-sm rounded-xl border bg-card p-6 shadow-sm">
        <h1 className="text-lg font-semibold">Log in to Billingly</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Use your email and password.
        </p>
        <form className="mt-4 space-y-3" onSubmit={handleSubmit}>
          <div className="space-y-1">
            <label className="text-sm font-medium">Email</label>
            <input
              name="email"
              type="email"
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              required
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium">Password</label>
            <input
              name="password"
              type="password"
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              required
            />
          </div>
          {error && (
            <p className="text-xs text-destructive mt-1" aria-live="polite">
              {error}
            </p>
          )}
          <Button type="submit" className="w-full" disabled={pending}>
            {pending ? "Logging in..." : "Log in"}
          </Button>
        </form>
      </div>
    </main>
  );
}

