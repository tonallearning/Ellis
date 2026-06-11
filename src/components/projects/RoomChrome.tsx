import Link from "next/link";

type RoomAccent = "basement" | "tl" | "goe";

const accentBar: Record<RoomAccent, string> = {
  basement: "bg-basement",
  tl: "bg-tl",
  goe: "bg-goe",
};

type RoomChromeProps = {
  title: string;
  subtitle: string;
  accent: RoomAccent;
  children: React.ReactNode;
  className?: string;
};

export function RoomChrome({
  title,
  subtitle,
  accent,
  children,
  className = "",
}: RoomChromeProps) {
  return (
    <div className={`flex flex-1 flex-col ${className}`}>
      <div className={`h-1 w-full ${accentBar[accent]}`} aria-hidden />
      <div className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:px-6">
        <Link
          href="/"
          className="focus-ring text-text-secondary hover:text-text-primary inline-flex items-center text-sm"
        >
          ← Ellis Hall
        </Link>
        <header className="mt-4 max-w-3xl">
          <h1 className="text-text-primary text-2xl font-medium tracking-tight sm:text-3xl">
            {title}
          </h1>
          <p className="text-text-secondary mt-2 text-base leading-relaxed">
            {subtitle}
          </p>
        </header>
        <div className="mt-6 flex min-h-0 flex-1 flex-col">{children}</div>
      </div>
    </div>
  );
}
