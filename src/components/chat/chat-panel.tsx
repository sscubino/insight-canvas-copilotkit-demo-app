"use client";

import { useEffect, useState } from "react";
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
import { useWorkspaceState } from "@/state/hooks/use-workspace-state";
import { useDatasetsState } from "@/state/hooks/use-datasets-state";
import { useSessionState } from "@/state/hooks/use-session-state";
import { Button } from "@/components/ui/button";
import { PaperclipIcon } from "@/components/icons/paperclip";
import { useChatSessionSync } from "@/hooks/use-chat-session-sync";

const ChatPanel = () => {
  const { selectedNodeId, deselectNode } = useWorkspaceState();
  const { selectedDatasets, isDatasetsInitialized } = useDatasetsState();
  const { isInitialized: isSessionInitialized, hydrationRecord } =
    useSessionState();
  const { handleFirstPromptSessionCreate } = useChatSessionSync();
  const [isDatasetDrawerOpen, setIsDatasetDrawerOpen] = useState(false);

  useEffect(() => {
    if (selectedNodeId) {
      setIsDatasetDrawerOpen(false);
    }
  }, [selectedNodeId]);

  useEffect(() => {
    if (!isSessionInitialized || !isDatasetsInitialized || hydrationRecord)
      return;
    if (selectedDatasets.length === 0) {
      setIsDatasetDrawerOpen(true);
    }
  }, [
    selectedDatasets,
    isSessionInitialized,
    isDatasetsInitialized,
    hydrationRecord,
  ]);

  const handleToggleDatasetDrawer = () => {
    if (!isDatasetDrawerOpen) deselectNode();
    setIsDatasetDrawerOpen((prev) => !prev);
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
          onSubmitMessage={handleFirstPromptSessionCreate}
          labels={{
            title: "Insight Canvas",
            initial: "Hi! \uD83D\uDC4B How can the agent help you with?",
            placeholder: "Type a prompt...",
          }}
          className="flex-1"
        />
        <DatasetDrawer
          isOpen={isDatasetDrawerOpen}
          onClose={() => setIsDatasetDrawerOpen(false)}
        />
        <NodeDetailDrawer />
      </SidebarContent>
    </Sidebar>
  );
};

export { ChatPanel };
