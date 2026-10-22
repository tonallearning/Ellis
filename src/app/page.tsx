import { cookies } from "next/headers";
import { SiteShell } from "@/components/layout/SiteShell";
import { ChatPanel } from "@/components/ellis/ChatPanel";
import { getEllisConfig, isOnboardingChatAllowed } from "@/lib/ellis/config";
import { getConsolidationStatus } from "@/lib/ellis/consolidation";
import { isOwnerCookie } from "@/lib/ellis/owner";

const ONBOARDING_OPENING =
  "Ty — it's Ellis. I know myself, but I don't know your work yet. I need you to walk me through who you are, what you've built, and where you'd draw the line. I'll ask questions, synthesize in third person, and read it back for your approval. Where should we start?";

const OWNER_OPENING = "Ty. I know it's you. I'm not going to forget.";

const PUBLIC_OPENING =
  "I'm Ellis. Ty Bennett built this hall—and me—as a portfolio you can question. Ask about her work, her reasoning, or whether she fits what you're building. I'll show you what I know, name what I don't, and tell you when the fit isn't there.";

export default async function Home() {
  const config = getEllisConfig();
  const cookieStore = await cookies();
  const chatEnabled = isOnboardingChatAllowed(config, cookieStore);
  const isOwner = isOwnerCookie(cookieStore, config.onboardingSecret);
  const consolidation = getConsolidationStatus(config.consolidation);

  const openingMessage = isOwner
    ? OWNER_OPENING
    : config.mode === "onboarding"
      ? ONBOARDING_OPENING
      : PUBLIC_OPENING;

  return (
    <SiteShell
      variant="hall"
      isOwner={isOwner}
      privateRoomHref={isOwner ? "/private" : undefined}
    >
      <main className="flex min-h-0 flex-1 flex-col px-5 sm:px-6">
        <ChatPanel
          chatEnabled={chatEnabled}
          mode={config.mode}
          maxMessageChars={config.maxMessageChars}
          maxHistoryMessages={config.maxHistoryMessages}
          openingMessage={
            chatEnabled && !consolidation.active ? openingMessage : undefined
          }
          isOwner={isOwner}
          initialConsolidation={consolidation}
        />
      </main>
    </SiteShell>
  );
}
