"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { SiteShell } from "@/components/layout/SiteShell";

export default function OnboardingUnlockPage() {
  const router = useRouter();
  const [secret, setSecret] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/ellis/onboarding/unlock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ secret }),
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => ({}))) as {
          error?: string;
        };
        throw new Error(payload.error ?? "Unlock failed");
      }

      router.push("/");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unlock failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <SiteShell variant="hall">
      <main className="flex flex-1 flex-col items-center justify-center px-6 py-16">
        <div className="glass-panel w-full max-w-md rounded-3xl p-8">
          <h1 className="text-text-primary text-2xl font-medium tracking-tight">
            Onboarding unlock
          </h1>
          <p className="text-text-secondary mt-3 text-sm leading-relaxed">
            Ellis is learning Ty in private. Enter the onboarding secret to chat.
          </p>
          <form className="mt-6 space-y-4" onSubmit={onSubmit}>
            <label className="block">
              <span className="text-text-secondary text-xs tracking-wide uppercase">
                Secret
              </span>
              <input
                type="password"
                value={secret}
                onChange={(event) => setSecret(event.target.value)}
                className="border-glass-border text-text-primary focus-ring mt-2 w-full rounded-xl border bg-transparent px-4 py-3"
                autoComplete="current-password"
              />
            </label>
            <button
              type="submit"
              disabled={loading || !secret}
              className="focus-ring bg-accent min-h-11 w-full rounded-full py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-40"
            >
              {loading ? "Unlocking…" : "Unlock Ellis Hall"}
            </button>
            {error ? (
              <p className="text-text-secondary text-sm" role="alert">
                {error}
              </p>
            ) : null}
          </form>
        </div>
      </main>
    </SiteShell>
  );
}
