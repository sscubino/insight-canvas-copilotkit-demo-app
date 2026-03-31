"use client";

import { InsightCanvas } from "@/components/canvas/insight-canvas";
import { ChatPanel } from "@/components/chat/chat-panel";
import { useCanvasAgentSharedState } from "@/hooks/use-canvas-agent-shared-state";
import { useChatSessionSync } from "@/hooks/use-chat-session-sync";
import { useCopilotDataTools } from "@/hooks/use-copilot-data-tools";
import { useCopilotSessionMemory } from "@/hooks/use-copilot-session-memory";
import { useActiveSchemas } from "@/hooks/use-datasets-state";

const CopilotCanvasSync = () => {
  useCanvasAgentSharedState();
  return null;
};

const CopilotDataToolsSync = () => {
  const activeSchemas = useActiveSchemas();
  useCopilotDataTools(activeSchemas);
  return null;
};

const CopilotSessionMemorySync = () => {
  useCopilotSessionMemory();
  return null;
};

const ChatSessionSync = () => {
  useChatSessionSync();
  return null;
};

const Home = () => {
  return (
    <>
      <CopilotCanvasSync />
      <CopilotDataToolsSync />
      <CopilotSessionMemorySync />
      <ChatSessionSync />
      <div className="flex h-full space-x-2">
        <main className="relative flex-1 card-container">
          <InsightCanvas />
        </main>
        <ChatPanel />
      </div>
    </>
  );
};

export default Home;
