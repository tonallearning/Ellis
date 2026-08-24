import { SITE } from "@/lib/site";

export function Footer() {
  const contactHref = SITE.contactEmail ? `mailto:${SITE.contactEmail}` : null;

  return (
    <footer className="text-text-secondary px-6 py-4 text-[0.7rem] leading-relaxed tracking-wide">
      <div className="mx-auto flex max-w-[40rem] flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <p className="max-w-sm">
          AI host. He may remember this conversation for seven days from the
          same connection. Then it fades.
        </p>
        {contactHref ? (
          <a
            href={contactHref}
            className="focus-ring text-text-primary shrink-0 underline-offset-4 hover:underline"
          >
            Contact Ty
          </a>
        ) : null}
      </div>
    </footer>
  );
}
