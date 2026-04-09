"use client";

import { useMemo, useRef, useState } from "react";
import { CopilotChat } from "@copilotkit/react-ui";
import type { InputProps } from "@copilotkit/react-ui";
import { useAgent } from "@copilotkit/react-core/v2";
import { SYSTEM_PROMPT } from "@/constants/system-prompt";
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarTitle,
} from "@/components/ui/sidebar";
import { ChatDrawers } from "@/components/chat/chat-drawers";
import { ChatInput } from "@/components/chat/chat-input";
import { useAppStore } from "@/state/store";
import { Spinner } from "@/components/ui/spinner";
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
  const isSessionInitialized = useAppStore((s) => s.isInitialized);
  const hydrationRecord = useAppStore((s) => s.hydrationRecord);
  const deselectNode = useAppStore((s) => s.deselectNode);

  const [isDatasetDrawerOpen, setIsDatasetDrawerOpen] = useState(false);

  const isWorkspaceInitialized = isSessionInitialized && !hydrationRecord;

  const handleToggleDatasetDrawer = () => {
    if (!isDatasetDrawerOpen) deselectNode();
    setIsDatasetDrawerOpen((prev) => !prev);
  };

  const toggleRef = useRef<() => void>(() => {});
  toggleRef.current = handleToggleDatasetDrawer;

  const CustomInput = useMemo(() => {
    const Component = (props: InputProps) => (
      <ChatInput {...props} onToggleDrawer={() => toggleRef.current()} />
    );
    Component.displayName = "CustomInput";
    return Component;
  }, []);

  const handleFirstPromptSessionCreate = async (prompt: string) => {
    const {
      activeSessionId,
      datasets,
      nodes,
      edges,
      selectedNodeId: selNodeId,
    } = useAppStore.getState();
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
        <SidebarTitle>Insight Copilot</SidebarTitle>
      </SidebarHeader>

      <SidebarContent className="relative overflow-hidden">
        <CopilotChat
          instructions={SYSTEM_PROMPT}
          onSubmitMessage={handleFirstPromptSessionCreate}
          UserMessage={UserMessage}
          Input={CustomInput}
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
        {isWorkspaceInitialized && (
          <ChatDrawers
            isDatasetDrawerOpen={isDatasetDrawerOpen}
            setIsOpen={setIsDatasetDrawerOpen}
          />
        )}
      </SidebarContent>
    </Sidebar>
  );
};

export { ChatPanel };
