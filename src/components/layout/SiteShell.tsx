import { Footer } from "@/components/layout/Footer";
import { ThemeToggle } from "@/components/theme/ThemeToggle";

type SiteShellProps = {
  children: React.ReactNode;
  variant?: "hall" | "plain";
};

export function SiteShell({ children, variant = "hall" }: SiteShellProps) {
  return (
    <div
      data-hall="default"
      className="relative flex min-h-dvh flex-1 flex-col"
    >
      {variant === "hall" ? (
        <>
          <div
            aria-hidden
            className="hall-ambient pointer-events-none absolute inset-0"
          />
          <div
            aria-hidden
            className="hall-grain pointer-events-none absolute inset-0 opacity-[0.28]"
          />
        </>
      ) : null}

      <header className="relative z-10 flex shrink-0 items-baseline justify-between px-6 pt-6 pb-3">
        <div>
          <p className="font-display text-text-primary text-[0.7rem] tracking-[0.32em] uppercase">
            Ellis
          </p>
          <p className="text-text-secondary mt-1 text-[0.65rem] tracking-[0.22em] uppercase">
            tybuilds
          </p>
        </div>
        <ThemeToggle />
      </header>

      <div className="relative z-10 flex min-h-0 flex-1 flex-col">
        {children}
      </div>

      <div className="relative z-10 shrink-0">
        <Footer />
      </div>
    </div>
  );
}
