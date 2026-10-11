import type { Metadata } from "next";
import Link from "next/link";
import { LegalArticle } from "@/components/layout/LegalArticle";
import { siteContactEmail } from "@/lib/site";

export const metadata: Metadata = {
  title: "Privacy",
  description:
    "What tybuilds.tech stores, how long it lasts, and how to ask for deletion.",
};

export default function PrivacyPage() {
  const contact = siteContactEmail();

  return (
    <LegalArticle title="Privacy">
      <p>
        Ellis is an AI host at <strong>tybuilds.tech</strong>, operated by Ty
        Bennett. This page is the precise version of the sentence in the footer.
      </p>

      <h2>What we collect</h2>

      <h3>Your conversation, in the browser</h3>
      <p>
        The current chat stays in your browser&apos;s session storage for this
        tab. Close the tab and that transcript is gone from your device. We do
        not keep a verbatim copy of the full chat on our servers.
      </p>

      <h3>A hashed connection, not your address</h3>
      <p>
        When you send a message, the server sees your IP long enough to hash it
        (SHA-256 with a private salt) and then stores the hash. We do not store
        the address. The salt is required in production; without it, chat
        refuses to run rather than storing something reversible.
      </p>

      <h3>Seven-day memory</h3>
      <p>
        For up to seven days from the same connection, we keep a short record
        keyed to that hash: a thread summary, dated beats (what was discussed,
        not a transcript), and when you were last here. If you return within
        that window, Ellis may remember the shape of the last visit. After
        seven days of inactivity, that hash-keyed row is deleted.
      </p>

      <h3>What remains after it fades</h3>
      <p>
        When a visitor row expires, themes and a compressed note may be kept as
        Ellis&apos;s own traces — without the hash, without your address, not
        as a profile of you. Those traces are how he grows. They are not a way
        to look you up later.
      </p>

      <h3>Usage</h3>
      <p>
        We keep a daily spend ledger keyed to the same hash (token estimates
        and a cost ceiling) so one visitor cannot run an unbounded bill. The
        row is for that UTC day. We do not tell visitors the dollar amount.
      </p>

      <h3>Ellis&apos;s interior</h3>
      <p>
        Ellis has one body that persists between visitors. It may include a
        hashed marker of recent conversations so he can be one person, not a
        reset. That is not your name, email, or address. Cold markers are
        dropped.
      </p>

      <h3>Cookies and preferences</h3>
      <ul>
        <li>
          Theme preference in local storage (light or dark). Stays on your
          device.
        </li>
        <li>
          An httpOnly cookie set only if you unlock with the operator secret.
          Visitors do not receive this. It lasts about a year and is how the
          operator is recognized as a person, not a household IP.
        </li>
      </ul>

      <h3>Technical logs</h3>
      <p>
        The host (Vercel) may log standard request metadata — IP, user agent,
        errors — as part of running a website. That is their infrastructure,
        not Ellis&apos;s memory.
      </p>

      <h2>AI processing</h2>
      <p>
        Your messages are sent to Anthropic to generate Ellis&apos;s replies.
        We send what is needed for that turn (the conversation so far, plus
        Ellis&apos;s system context). We do not use visitor conversations to
        train our own models.
      </p>
      <p>
        Anthropic processes that data under{" "}
        <a
          href="https://www.anthropic.com/legal/privacy"
          className="focus-ring"
        >
          their privacy policy
        </a>
        . Do not paste passwords, financial information, or anyone else&apos;s
        private details into the hall.
      </p>

      <h2>Where it lives</h2>
      <ul>
        <li>
          <strong>Vercel</strong> — hosting and request handling
        </li>
        <li>
          <strong>Supabase</strong> — hashed memory, usage ledger, Ellis&apos;s
          interior
        </li>
        <li>
          <strong>Anthropic</strong> — generating replies
        </li>
      </ul>

      <h2>Sharing</h2>
      <p>We do not sell your information.</p>
      <p>We share it only with the providers above, when required by law, or to keep the service from being abused.</p>

      <h2>How long</h2>
      <ul>
        <li>Browser transcript: this tab</li>
        <li>Hash-keyed visit memory: seven days of inactivity, then deleted</li>
        <li>Daily usage: that UTC day</li>
        <li>Compressed traces: kept as Ellis&apos;s history, not as yours</li>
        <li>Operator memory: until the operator asks to clear it</li>
      </ul>

      <h2>Your choices</h2>
      <p>
        You choose what you type. You can stop using the site at any time. To
        ask us to delete hash-keyed records we can still find, email{" "}
        <a href={`mailto:${contact}`} className="focus-ring">
          {contact}
        </a>
        . Include the approximate time you visited if you can — we cannot reverse
        a hash back to an address, so a timestamp helps. Compressed traces with
        no identifier may not be attributable to you; we will not pretend
        otherwise.
      </p>

      <h2>Children</h2>
      <p>
        Ellis is for people <strong>18 and older</strong>. We do not knowingly
        collect information from anyone younger. If you believe a minor has
        used the hall, tell us at the address above.
      </p>

      <h2>Contact</h2>
      <p>
        Privacy questions and deletion requests:{" "}
        <a href={`mailto:${contact}`} className="focus-ring">
          {contact}
        </a>
        .
      </p>
      <p>
        Related: <Link href="/terms">Terms of use</Link>.
      </p>
    </LegalArticle>
  );
}
