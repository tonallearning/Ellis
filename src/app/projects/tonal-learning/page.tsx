import { SiteShell } from "@/components/layout/SiteShell";
import { RoomChrome } from "@/components/projects/RoomChrome";
import { SITE } from "@/lib/site";

export default function TonalLearningPage() {
  return (
    <SiteShell variant="plain">
      <RoomChrome
        accent="tl"
        title="Tonal Learning"
        subtitle="Thai learning with Lexi and Lumi — an instrument for reading the confusion window before acquisition clicks."
      >
        <div className="glass-panel max-w-3xl rounded-3xl p-6 sm:p-8">
          <p className="text-text-primary text-base leading-relaxed">
            Most adult tonal-language learners quit in the first two weeks —
            often during a confusion window that precedes perceptual
            reorganization. Tonal Learning is a controlled conversational
            environment with trace instrumentation to ask whether
            pre-acquisition states have a predictable signature before
            performance improves.
          </p>
          <p className="text-text-secondary mt-4 text-base leading-relaxed">
            Product is the instrument. Ellis will speak to the research in depth
            after Ty walks him through it — for now, the live site is the proof.
          </p>
          <a
            href={SITE.tonalLearningUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="focus-ring bg-tl mt-8 inline-flex min-h-11 items-center rounded-full px-6 py-3 text-sm font-medium text-white transition hover:opacity-90"
          >
            Open tonallearning.com →
          </a>
        </div>
      </RoomChrome>
    </SiteShell>
  );
}
