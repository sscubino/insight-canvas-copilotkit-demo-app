"use client";

import { InsightCanvas } from "@/components/canvas/insight-canvas";
import { ChatPanel } from "@/components/chat/chat-panel";
import { CanvasStateProvider } from "@/contexts/canvas-state-context";
import { useCopilotCanvas } from "@/hooks/use-copilot-canvas";
import { useCopilotDataTools } from "@/hooks/use-copilot-data-tools";
import { useLoadDataset } from "@/hooks/use-load-dataset";
import type { DatasetSchema } from "@/types/duckdb";

const CopilotCanvasSync = () => {
  useCopilotCanvas();
  return null;
};

const CopilotDataToolsSync = ({ schema }: { schema: DatasetSchema | null }) => {
  useCopilotDataTools(schema);
  return null;
};

const Home = () => {
  const { schema } = useLoadDataset({
    filePath: "/data/saas-churn.csv",
    tableName: "saas_churn",
  });

  return (
    <CanvasStateProvider>
      <CopilotCanvasSync />
      <CopilotDataToolsSync schema={schema} />
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
