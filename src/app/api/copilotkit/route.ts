import { SYSTEM_PROMPT } from "@/constants/system-prompt";
import {
  CopilotRuntime,
  copilotRuntimeNextJSAppRouterEndpoint,
} from "@copilotkit/runtime";
import { BuiltInAgent } from "@copilotkit/runtime/v2";
import { NextRequest } from "next/server";
import config from "@/lib/config";

const builtInAgent = new BuiltInAgent({
  model: config.copilotkit.builtInAgentModel,
  prompt: SYSTEM_PROMPT,
});

const runtime = new CopilotRuntime({
  agents: { default: builtInAgent },
});

export const POST = async (req: NextRequest) => {
  const { handleRequest } = copilotRuntimeNextJSAppRouterEndpoint({
    runtime,
    endpoint: "/api/copilotkit",
  });

  return handleRequest(req);
};
