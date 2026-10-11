import Link from "next/link";
import { SITE } from "@/lib/site";

type FooterProps = {
  isOwner?: boolean;
};

export function Footer({ isOwner = false }: FooterProps) {
  const contactHref = SITE.contactEmail ? `mailto:${SITE.contactEmail}` : null;

  return (
    <footer className="text-text-secondary px-6 py-4 text-[0.7rem] leading-relaxed tracking-wide">
      <div className="mx-auto flex max-w-[40rem] flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <p className="max-w-sm">
          {isOwner
            ? "AI host. He remembers you. The seven-day clock is for everyone else."
            : "AI host. He may remember this conversation for seven days from the same connection. Then the specifics fade."}
        </p>
        <nav
          aria-label="Legal"
          className="text-text-primary flex shrink-0 flex-wrap gap-x-3 gap-y-1"
        >
          <Link
            href="/privacy"
            className="focus-ring underline-offset-4 hover:underline"
          >
            Privacy
          </Link>
          <Link
            href="/terms"
            className="focus-ring underline-offset-4 hover:underline"
          >
            Terms
          </Link>
          {contactHref ? (
            <a
              href={contactHref}
              className="focus-ring underline-offset-4 hover:underline"
            >
              Contact Ty
            </a>
          ) : null}
        </nav>
      </div>
    </footer>
  );
}
