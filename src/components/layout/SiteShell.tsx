import Link from "next/link";
import { Footer } from "@/components/layout/Footer";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { TheWork } from "@/components/work/TheWork";

type SiteShellProps = {
  children: React.ReactNode;
  variant?: "hall" | "plain";
  isOwner?: boolean;
};

export function SiteShell({
  children,
  variant = "hall",
  isOwner = false,
}: SiteShellProps) {
  return (
    <div
      data-hall="default"
      className={`relative flex flex-1 flex-col ${
        variant === "hall" ? "h-dvh overflow-hidden" : "min-h-dvh"
      }`}
    >
      {variant === "hall" ? (
        <>
          <div
            aria-hidden
            className="hall-ambient pointer-events-none absolute inset-0"
          />
          <div
            aria-hidden
            className="hall-grain pointer-events-none absolute inset-0"
          />
        </>
      ) : null}

      <header className="relative z-10 flex shrink-0 items-baseline justify-between px-6 pt-6 pb-3">
        <Link href="/" className="focus-ring rounded-sm">
          <p className="font-display text-text-primary text-[0.7rem] tracking-[0.32em] uppercase">
            Ellis
          </p>
          <p className="text-text-secondary mt-1 text-[0.65rem] tracking-[0.22em] uppercase">
            tybuilds
          </p>
        </Link>
        <nav className="flex items-baseline gap-1" aria-label="Hall">
          <TheWork />
          <ThemeToggle />
        </nav>
      </header>

      <div className="relative z-10 flex min-h-0 flex-1 flex-col">
        {children}
      </div>

      <div className="relative z-10 shrink-0">
        <Footer isOwner={isOwner} />
      </div>
    </div>
  );
}
