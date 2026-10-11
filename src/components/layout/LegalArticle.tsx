import type { ReactNode } from "react";
import Link from "next/link";
import { SiteShell } from "@/components/layout/SiteShell";
import { siteContactEmail } from "@/lib/site";

type LegalArticleProps = {
  title: string;
  children: ReactNode;
};

export function LegalArticle({ title, children }: LegalArticleProps) {
  const contact = siteContactEmail();

  return (
    <SiteShell variant="hall">
      <main className="relative z-10 min-h-0 flex-1 overflow-y-auto px-6 pb-16">
        <article className="legal-prose mx-auto w-full max-w-[40rem] pt-4">
          <p className="legal-eyebrow">
            <Link href="/" className="focus-ring">
              Ellis
            </Link>
          </p>
          <h1>{title}</h1>
          <p className="legal-updated">Last updated August 24, 2026</p>
          {children}
          <p className="legal-nav">
            <Link href="/privacy" className="focus-ring">
              Privacy
            </Link>
            {" · "}
            <Link href="/terms" className="focus-ring">
              Terms
            </Link>
            {" · "}
            <a href={`mailto:${contact}`} className="focus-ring">
              Contact
            </a>
          </p>
        </article>
      </main>
    </SiteShell>
  );
}
