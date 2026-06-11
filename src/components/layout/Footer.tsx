import Link from "next/link";
import { SITE } from "@/lib/site";

export function Footer() {
  const contactHref = SITE.contactEmail ? `mailto:${SITE.contactEmail}` : null;

  return (
    <footer className="border-glass-border text-text-secondary border-t px-6 py-5 text-sm">
      <div className="mx-auto flex max-w-3xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="max-w-md leading-relaxed">
          Ellis is an AI host powered by Claude. This visit is session-only — he
          won&apos;t remember you next time, and he&apos;ll say so.
        </p>
        <div className="flex shrink-0 flex-wrap items-center gap-x-4 gap-y-2">
          {contactHref ? (
            <a
              href={contactHref}
              className="focus-ring text-text-primary underline-offset-4 hover:underline"
            >
              Contact Ty
            </a>
          ) : (
            <span className="text-text-secondary">
              Contact — configure email at deploy
            </span>
          )}
          <Link
            href="/"
            className="focus-ring underline-offset-4 hover:underline"
          >
            Ellis Hall
          </Link>
        </div>
      </div>
    </footer>
  );
}
