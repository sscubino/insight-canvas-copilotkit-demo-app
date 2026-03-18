"use client";

import { CopilotChat } from "@copilotkit/react-ui";
import { SYSTEM_PROMPT } from "@/constants/system-prompt";
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarTitle,
} from "@/components/ui/sidebar";
import { DatasetDrawer } from "@/components/datasets/dataset-drawer";
import { useDatasets } from "@/contexts/dataset-context";
import { Button } from "@/components/ui/button";
import { PaperclipIcon } from "@/components/icons/paperclip";

const ChatPanel = () => {
  const { toggleDrawer } = useDatasets();

  return (
    <Sidebar
      side="right"
      expandedWidth="w-md"
      innerMinWidth="min-w-md"
      aria-label="Chat panel"
    >
      <SidebarHeader>
        <div className="flex items-center gap-2">
          <SidebarTitle>Insight Copilot</SidebarTitle>
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleDrawer}
            aria-label="Open datasets"
          >
            <PaperclipIcon width={16} height={16} />
          </Button>
        </div>
      </SidebarHeader>

      <SidebarContent className="relative overflow-hidden">
        <CopilotChat
          instructions={SYSTEM_PROMPT}
          labels={{
            title: "Insight Canvas",
            initial: "Hi! \uD83D\uDC4B How can the agent help you with?",
            placeholder: "Type a prompt...",
          }}
          className="flex-1"
        />
        <DatasetDrawer />
      </SidebarContent>
    </Sidebar>
  );
};

export { ChatPanel };
