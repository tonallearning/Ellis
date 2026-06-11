import { SiteShell } from "@/components/layout/SiteShell";
import { RoomChrome } from "@/components/projects/RoomChrome";
import { GOE_TEASE } from "@/lib/site";

export default function GoEPage() {
  return (
    <SiteShell variant="plain">
      <RoomChrome
        accent="goe"
        title="Garden of Ellis"
        subtitle="Public tease only — inhabited agents, house physics, honest scope."
      >
        <div className="glass-panel max-w-3xl space-y-6 rounded-3xl p-6 sm:p-8">
          <p className="text-text-primary text-lg leading-relaxed">
            {GOE_TEASE}
          </p>
          <p className="text-text-secondary text-base leading-relaxed">
            GoE is private work in progress. Ellis can explain the thesis and
            why it matters — he won&apos;t walk through step-by-step build
            recipes or leak secret sauce. If you need depth beyond what&apos;s
            public, talk to Ty.
          </p>
          <p className="border-glass-border bg-surface-1/50 text-text-secondary rounded-2xl border px-4 py-3 text-sm">
            Ada — related agent work — is in development. No public demo yet.
          </p>
        </div>
      </RoomChrome>
    </SiteShell>
  );
}
