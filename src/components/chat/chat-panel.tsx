"use client";

import { useEffect } from "react";
import { CopilotChat } from "@copilotkit/react-ui";
import { SYSTEM_PROMPT } from "@/constants/system-prompt";
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarTitle,
} from "@/components/ui/sidebar";
import { DatasetDrawer } from "@/components/chat/datasets/dataset-drawer";
import { NodeDetailDrawer } from "@/components/chat/node-detail/node-detail-drawer";
import { useDatasets } from "@/contexts/dataset-context";
import { useCanvasState } from "@/contexts/canvas-state-context";
import { Button } from "@/components/ui/button";
import { PaperclipIcon } from "@/components/icons/paperclip";

const ChatPanel = () => {
  const { selectedNodeId, deselectNode } = useCanvasState();
  const {
    isDrawerOpen: isDatasetDrawerOpen,
    closeDrawer: closeDatasetDrawer,
    toggleDrawer,
  } = useDatasets();

  useEffect(() => {
    if (selectedNodeId) closeDatasetDrawer();
  }, [selectedNodeId, closeDatasetDrawer]);

  const handleToggleDatasetDrawer = () => {
    if (!isDatasetDrawerOpen) deselectNode();
    toggleDrawer();
  };

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
            onClick={handleToggleDatasetDrawer}
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
        <NodeDetailDrawer />
      </SidebarContent>
    </Sidebar>
  );
};

export { ChatPanel };
