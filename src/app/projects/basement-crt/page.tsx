import { SiteShell } from "@/components/layout/SiteShell";
import { RoomChrome } from "@/components/projects/RoomChrome";

export default function BasementCrtPage() {
  return (
    <SiteShell variant="plain">
      <RoomChrome
        accent="basement"
        title="Basement CRT"
        subtitle="Living-room teaching console — retro shell, modern questions about AI."
        className="min-h-[calc(100vh-8rem)]"
      >
        <div className="border-glass-border overflow-hidden rounded-2xl border bg-[#120c08] shadow-2xl">
          <iframe
            src="/demos/basement-crt.html"
            title="Basement CRT demo"
            className="aspect-[4/3] min-h-[480px] w-full border-0 sm:min-h-[560px]"
            loading="lazy"
            sandbox="allow-scripts allow-same-origin allow-forms"
          />
        </div>
      </RoomChrome>
    </SiteShell>
  );
}
