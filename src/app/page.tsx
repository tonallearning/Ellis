import { SiteShell } from "@/components/layout/SiteShell";
import { ChatPanelShell } from "@/components/hall/ChatPanelShell";

export default function Home() {
  return (
    <SiteShell variant="hall">
      <main className="flex flex-1 flex-col px-4 pt-2 pb-8 sm:px-6">
        <ChatPanelShell />
      </main>
    </SiteShell>
  );
}
