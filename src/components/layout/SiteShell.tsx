import { Footer } from "@/components/layout/Footer";
import { ThemeToggle } from "@/components/theme/ThemeToggle";

type SiteShellProps = {
  children: React.ReactNode;
  variant?: "hall" | "plain";
};

export function SiteShell({ children, variant = "hall" }: SiteShellProps) {
  return (
    <div
      className={
        variant === "hall"
          ? "relative flex min-h-full flex-1 flex-col overflow-hidden"
          : "flex min-h-full flex-1 flex-col"
      }
    >
      {variant === "hall" ? (
        <>
          <div
            aria-hidden
            className="hall-ambient pointer-events-none absolute inset-0"
          />
          <div
            aria-hidden
            className="hall-grain pointer-events-none absolute inset-0 opacity-[0.35]"
          />
        </>
      ) : null}

      <header className="relative z-10 flex items-center justify-between px-6 py-4">
        <div className="font-display text-text-secondary text-sm tracking-[0.24em] uppercase">
          tybuilds
        </div>
        <ThemeToggle />
      </header>

      <div className="relative z-10 flex flex-1 flex-col">{children}</div>

      <div className="relative z-10">
        <Footer />
      </div>
    </div>
  );
}
