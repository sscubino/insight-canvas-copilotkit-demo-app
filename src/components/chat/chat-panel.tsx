"use client";

import { CopilotChat } from "@copilotkit/react-ui";
import { SYSTEM_PROMPT } from "@/constants/system-prompt";
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
} from "@/components/ui/sidebar";

const ChatPanel = () => (
  <Sidebar
    side="right"
    expandedWidth="w-md"
    innerMinWidth="min-w-[446px]"
    className="shadow-[-9px_0px_17px_-6px_rgba(1,5,7,0.06)]"
    aria-label="Chat panel"
  >
    <SidebarHeader>
      <span className="text-lg font-medium text-foreground">Agent</span>
    </SidebarHeader>

    <SidebarContent>
      <CopilotChat
        instructions={SYSTEM_PROMPT}
        labels={{
          title: "Insight Canvas",
          initial: "Hi! \uD83D\uDC4B How can the agent help you with?",
          placeholder: "Type a prompt...",
        }}
        className="flex-1"
      />
    </SidebarContent>
  </Sidebar>
);

export { ChatPanel };
