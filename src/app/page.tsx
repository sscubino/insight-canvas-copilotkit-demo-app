"use client";

import { InsightCanvas } from "@/components/canvas/insight-canvas";
import { ChatPanel } from "@/components/chat/chat-panel";
import { CanvasStateProvider } from "@/contexts/canvas-state-context";
import { useCopilotCanvas } from "@/hooks/use-copilot-canvas";

const CopilotCanvasSync = () => {
  useCopilotCanvas();
  return null;
};

const Home = () => {
  return (
    <CanvasStateProvider>
      <CopilotCanvasSync />
      <div className="flex h-full">
        <main className="relative flex-1 overflow-hidden bg-background">
          <InsightCanvas />
        </main>
        <ChatPanel />
      </div>
    </CanvasStateProvider>
  );
};

export default Home;
