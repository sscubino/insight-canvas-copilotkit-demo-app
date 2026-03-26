import { anthropic } from "@ai-sdk/anthropic";
import { Agent } from "@mastra/core/agent";
import { Memory } from "@mastra/memory";
import { LibSQLStore } from "@mastra/libsql";
import { SYSTEM_PROMPT } from "@/constants/system-prompt";
import { INSIGHT_CANVAS_AGENT_ID } from "@/mastra/constants";
import { AgentCanvasStateSchema } from "./state";

export { INSIGHT_CANVAS_AGENT_ID };

export const insightCanvasAgent = new Agent({
  id: INSIGHT_CANVAS_AGENT_ID,
  name: INSIGHT_CANVAS_AGENT_ID,
  model: anthropic("claude-sonnet-4-6"),
  instructions: SYSTEM_PROMPT,
  memory: new Memory({
    storage: new LibSQLStore({
      id: "insight-canvas-memory",
      url: "file::memory:",
    }),
    options: {
      workingMemory: {
        enabled: true,
        scope: "thread",
        schema: AgentCanvasStateSchema,
      },
    },
  }),
});
