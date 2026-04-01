"use client";

import { InsightCanvas } from "@/components/canvas/insight-canvas";
import { ChatPanel } from "@/components/chat/chat-panel";
import { useCopilotCanvas } from "@/hooks/use-copilot-canvas";
import { useCopilotDataTools } from "@/hooks/use-copilot-data-tools";
import { useCopilotSessionMemory } from "@/hooks/use-copilot-session-memory";
import { useDatasetsState } from "@/state/hooks/use-datasets-state";

const CopilotCanvasSync = () => {
  useCopilotCanvas();
  return null;
};

const CopilotDataToolsSync = () => {
  const { activeSchemas } = useDatasetsState();
  useCopilotDataTools(activeSchemas);
  return null;
};

const CopilotSessionMemorySync = () => {
  useCopilotSessionMemory();
  return null;
};

const Home = () => {
  return (
    <>
      <CopilotCanvasSync />
      <CopilotDataToolsSync />
      <CopilotSessionMemorySync />
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
