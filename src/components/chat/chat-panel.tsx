"use client";

import { CopilotChat } from "@copilotkit/react-ui";
import { SYSTEM_PROMPT } from "@/constants/system-prompt";
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarTitle,
} from "@/components/ui/sidebar";

const ChatPanel = () => (
  <Sidebar
    side="right"
    expandedWidth="w-md"
    innerMinWidth="min-w-md"
    aria-label="Chat panel"
  >
    <SidebarHeader>
      <SidebarTitle>Insight Copilot</SidebarTitle>
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
