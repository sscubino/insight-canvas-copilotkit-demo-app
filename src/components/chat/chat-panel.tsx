"use client";

import { useEffect, useState } from "react";
import { CopilotChat } from "@copilotkit/react-core/v2";
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
import { Spinner } from "@/components/ui/spinner";
import { PaperclipIcon } from "@/components/icons/paperclip";
import { useChatSessionSync } from "@/hooks/use-chat-session-sync";
import { cn } from "@/lib/utils";
import { INSIGHT_CANVAS_AGENT_ID } from "@/mastra/constants";

const ChatPanel = () => {
  const { selectedNodeId, deselectNode } = useWorkspaceState();
  const { selectedDatasets, isDatasetsInitialized } = useDatasetsState();
  const { isInitialized: isSessionInitialized, hydrationRecord } =
    useSessionState();
  useChatSessionSync();
  const [isDatasetDrawerOpen, setIsDatasetDrawerOpen] = useState(false);

  const isWorkspaceInitialized =
    isSessionInitialized && isDatasetsInitialized && !hydrationRecord;

  useEffect(() => {
    if (selectedNodeId) {
      setIsDatasetDrawerOpen(false);
    }
  }, [selectedNodeId]);

  useEffect(() => {
    if (!isWorkspaceInitialized) return;
    if (selectedDatasets.length === 0) {
      setIsDatasetDrawerOpen(true);
    }
  }, [selectedDatasets, isWorkspaceInitialized]);

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
          agentId={INSIGHT_CANVAS_AGENT_ID}
          labels={{
            modalHeaderTitle: "Insight Canvas",
            welcomeMessageText:
              "Hi! \uD83D\uDC4B How can the agent help you with?",
            chatInputPlaceholder: "Type a prompt...",
          }}
          className={cn(
            "flex-1 transition-opacity duration-200",
            !isWorkspaceInitialized && "opacity-0"
          )}
        />
        {!isWorkspaceInitialized && (
          <div className="absolute inset-0 flex items-center justify-center">
            <Spinner size="lg" />
          </div>
        )}
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
