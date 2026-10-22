import type { Metadata } from "next";
import Link from "next/link";
import { SiteShell } from "@/components/layout/SiteShell";

export const metadata: Metadata = {
  title: "Not here",
  description: "This path does not lead to Ellis.",
};

export default function NotFound() {
  return (
    <SiteShell variant="hall">
      <main className="flex min-h-0 flex-1 items-center px-6 pb-16">
        <div className="mx-auto w-full max-w-[42rem]">
          <p className="text-accent text-[0.65rem] tracking-[0.28em] uppercase">
            404 · Not here
          </p>
          <h1 className="text-text-primary mt-5 max-w-[18ch] text-[clamp(2.3rem,7vw,4.5rem)] leading-[1.08] font-medium tracking-[-0.045em]">
            He&apos;s not lost. He&apos;s just not where you&apos;re looking.
          </h1>
          <Link
            href="/"
            className="focus-ring text-text-secondary hover:text-text-primary mt-9 inline-block rounded-sm text-sm underline-offset-4 transition-colors hover:underline"
          >
            Return to the hall →
          </Link>
        </div>
      </main>
    </SiteShell>
  );
}
