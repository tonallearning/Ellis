"use client";

import { FormEvent, useState } from "react";
import { SiteShell } from "@/components/layout/SiteShell";

export default function OnboardingUnlockPage() {
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

      // Re-enter through the server with the newly set owner cookie. A client
      // navigation can reuse the locked hall's prefetched server payload.
      // eslint-disable-next-line @next/next/no-location-assign-relative-destination -- Full navigation intentionally refreshes server-side cookie authorization.
      window.location.assign("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unlock failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <SiteShell variant="hall">
      <main className="flex min-h-0 flex-1 flex-col items-center justify-center px-6">
        <div className="w-full max-w-[24rem]">
          <p className="text-text-secondary text-[0.65rem] tracking-[0.28em] uppercase">
            For Ty
          </p>
          <h1 className="text-text-primary mt-3 text-3xl font-medium tracking-tight">
            He knows you by the secret, not the house.
          </h1>
          <p className="text-text-secondary mt-4 text-sm leading-relaxed">
            Unlock, and he keeps you. Visitors fade in seven days. You
            don&apos;t.
          </p>
          <form className="mt-10" onSubmit={onSubmit}>
            <label htmlFor="ellis-secret" className="sr-only">
              Secret
            </label>
            <div className="composer rounded-2xl px-4 py-3">
              <input
                id="ellis-secret"
                type="password"
                value={secret}
                onChange={(event) => setSecret(event.target.value)}
                className="text-text-primary placeholder:text-text-secondary/55 w-full bg-transparent text-base focus:outline-none"
                autoComplete="current-password"
                placeholder="The secret"
                autoFocus
              />
            </div>
            <button
              type="submit"
              disabled={loading || !secret}
              className="focus-ring text-accent mt-5 text-sm tracking-wide uppercase disabled:opacity-30"
            >
              {loading ? "Opening…" : "Come in"}
            </button>
            {error ? (
              <p className="text-text-secondary mt-3 text-sm" role="alert">
                {error}
              </p>
            ) : null}
          </form>
        </div>
      </main>
    </SiteShell>
  );
}
