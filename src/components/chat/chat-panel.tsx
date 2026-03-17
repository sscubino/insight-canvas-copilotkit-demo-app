"use client";

import { CopilotChat } from "@copilotkit/react-ui";
import { SYSTEM_PROMPT } from "@/constants/system-prompt";

const ChatPanel = () => {
  return (
    <aside className="flex w-md shrink-0 flex-col border border-border-card bg-surface-50 rounded-lg overflow-hidden">
      <header className="flex items-center justify-between border-b border-border-card px-3.5 py-3">
        <span className="text-sm font-semibold text-foreground">
          Insight Copilot
        </span>
      </header>

      <div className="flex min-h-0 flex-1 flex-col">
        <CopilotChat
          instructions={SYSTEM_PROMPT}
          labels={{
            title: "Insight Canvas",
            initial: "Hi! \uD83D\uDC4B How can the agent help you with?",
            placeholder: "Type a prompt...",
          }}
          className="flex-1"
        />
      </div>
    </aside>
  );
};

export { ChatPanel };
