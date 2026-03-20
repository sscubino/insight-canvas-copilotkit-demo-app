"use client";

import { InsightCanvas } from "@/components/canvas/insight-canvas";
import { ChatPanel } from "@/components/chat/chat-panel";
import { CanvasStateProvider } from "@/contexts/canvas-state-context";
import { DatasetProvider, useDatasets } from "@/contexts/dataset-context";
import { useCopilotCanvas } from "@/hooks/use-copilot-canvas";
import { useCopilotDataTools } from "@/hooks/use-copilot-data-tools";

const CopilotCanvasSync = () => {
  useCopilotCanvas();
  return null;
};

const CopilotDataToolsSync = () => {
  const { activeSchemas } = useDatasets();
  useCopilotDataTools(activeSchemas);
  return null;
};

const Home = () => (
  <DatasetProvider>
    <CanvasStateProvider>
      <CopilotCanvasSync />
      <CopilotDataToolsSync />
      <div className="flex h-full space-x-2">
        <main className="relative flex-1 card-container">
          <InsightCanvas />
        </main>
        <ChatPanel />
      </div>
    </CanvasStateProvider>
  </DatasetProvider>
);

export default Home;
