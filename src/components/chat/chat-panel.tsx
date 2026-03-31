"use client";

import { useEffect, useState } from "react";
import { CopilotChat } from "@copilotkit/react-ui";
import { useAgent } from "@copilotkit/react-core/v2";
import { SYSTEM_PROMPT } from "@/constants/system-prompt";
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarTitle,
} from "@/components/ui/sidebar";
import { DatasetDrawer } from "@/components/chat/datasets/dataset-drawer";
import { NodeDetailDrawer } from "@/components/chat/node-detail/node-detail-drawer";
import { useAppStore } from "@/state/store";
import { useSelectedDatasets } from "@/hooks/use-datasets-state";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { PaperclipIcon } from "@/components/icons/paperclip";
import { UserMessage } from "@/components/chat/user-message";
import { cn } from "@/lib/utils";
import { generateSessionTitle } from "@/actions/generate-session-title";
import { serializeForStorage } from "@/lib/sessions";
import {
  createSessionFromFirstPrompt,
  setSessionName,
} from "@/lib/workflows/session-workflows";

const ChatPanel = () => {
  const { agent } = useAgent();
  const selectedNodeId = useAppStore((s) => s.selectedNodeId);
  const deselectNode = useAppStore((s) => s.deselectNode);
  const selectedDatasets = useSelectedDatasets();
  const isSessionInitialized = useAppStore((s) => s.isInitialized);
  const hydrationRecord = useAppStore((s) => s.hydrationRecord);
  const [isDatasetDrawerOpen, setIsDatasetDrawerOpen] = useState(false);

  const isWorkspaceInitialized = isSessionInitialized && !hydrationRecord;

  useEffect(() => {
    if (selectedNodeId) {
      setIsDatasetDrawerOpen(false);
    }
  }, [selectedNodeId]);

  useEffect(() => {
    if (!isWorkspaceInitialized) return;
    if (selectedDatasets.length !== 0) return;
    setIsDatasetDrawerOpen(true);
  }, [selectedDatasets, isWorkspaceInitialized]);

  const handleToggleDatasetDrawer = () => {
    if (!isDatasetDrawerOpen) deselectNode();
    setIsDatasetDrawerOpen((prev) => !prev);
  };

  const handleFirstPromptSessionCreate = async (prompt: string) => {
    const { activeSessionId, datasets, nodes, edges, selectedNodeId: selNodeId } =
      useAppStore.getState();
    if (activeSessionId) return;

    const selected = datasets.filter((d) => d.isSelected);
    const sessionId = await createSessionFromFirstPrompt({
      firstPrompt: prompt,
      selectedDatasetIds: selected.map((d) => d.id),
      snapshot: {
        messages: serializeForStorage(agent.messages),
        canvas: { nodes, edges, selectedNodeId: selNodeId },
        selectedDatasetIds: selected.map((d) => d.id),
        selectedDatasetNames: selected.map((d) => d.name),
      },
    });

    try {
      const title = await generateSessionTitle({
        firstPrompt: prompt,
        selectedDatasets: selected.map((d) => d.name),
      });
      if (!title || title.trim().length === 0) return;
      await setSessionName(sessionId, title);
    } catch (error) {
      console.error("Failed to generate session title:", error);
    }
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
          UserMessage={UserMessage}
          labels={{
            title: "Insight Canvas",
            initial: "Hi! \uD83D\uDC4B How can the agent help you with?",
            placeholder: "Type a prompt...",
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
