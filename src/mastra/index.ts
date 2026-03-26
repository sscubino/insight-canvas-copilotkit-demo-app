import { Mastra } from "@mastra/core/mastra";
import { LibSQLStore } from "@mastra/libsql";
import { insightCanvasAgent, INSIGHT_CANVAS_AGENT_ID } from "./agents";

export const mastra = new Mastra({
  agents: {
    [INSIGHT_CANVAS_AGENT_ID]: insightCanvasAgent,
  },
  storage: new LibSQLStore({
    id: "mastra-storage",
    url: ":memory:",
  }),
});
