"use client";

import { CopilotChat } from "@copilotkit/react-ui";
import { StatusDot } from "@/components/ui/status-dot";

const ChatPanel = () => {
  return (
    <aside className="flex w-80 shrink-0 flex-col border-l border-border bg-surface">
      <header className="flex items-center justify-between border-b border-border px-3.5 py-3">
        <span className="text-sm font-semibold text-foreground">Agent</span>
        <div className="flex items-center gap-1 font-mono text-xs text-success">
          <StatusDot className="bg-success" pulse />
          active
        </div>
      </header>

      <div className="flex min-h-0 flex-1 flex-col">
        <CopilotChat
          labels={{
            title: "Insight Canvas",
            initial:
              "Hi! I'm your data analysis partner. Upload a dataset and ask me a question to get started.",
            placeholder: "Ask about your data...",
          }}
          className="flex-1"
        />
      </div>
    </aside>
  );
};

export { ChatPanel };
