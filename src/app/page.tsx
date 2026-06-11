import { cookies } from "next/headers";
import { SiteShell } from "@/components/layout/SiteShell";
import { ChatPanel } from "@/components/ellis/ChatPanel";
import { getEllisConfig, isOnboardingChatAllowed } from "@/lib/ellis/config";

const ONBOARDING_OPENING =
  "Ty — it's Ellis. I know myself, but I don't know your work yet. I need you to walk me through who you are, what you've built, and where you'd draw the line. I'll ask questions, synthesize in third person, and read it back for your approval. Where should we start?";

const PUBLIC_OPENING =
  "I'm Ellis — I host conversations here so visitors can assess whether Ty is a fit. Ask about her work; I'll be honest, including when I don't know.";

export default async function Home() {
  const config = getEllisConfig();
  const cookieStore = await cookies();
  const chatEnabled = isOnboardingChatAllowed(config, cookieStore);

  const openingMessage =
    config.mode === "onboarding" ? ONBOARDING_OPENING : PUBLIC_OPENING;

  return (
    <SiteShell variant="hall">
      <main className="flex flex-1 flex-col px-4 pb-8 pt-2 sm:px-6">
        <ChatPanel
          chatEnabled={chatEnabled}
          mode={config.mode}
          maxMessageChars={config.maxMessageChars}
          openingMessage={chatEnabled ? openingMessage : undefined}
        />
      </main>
    </SiteShell>
  );
}
