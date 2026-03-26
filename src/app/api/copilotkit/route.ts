import {
  CopilotRuntime,
  ExperimentalEmptyAdapter,
  copilotRuntimeNextJSAppRouterEndpoint,
} from "@copilotkit/runtime";
import { MastraAgent } from "@ag-ui/mastra";
import { NextRequest } from "next/server";
import { mastra } from "@/mastra";

const serviceAdapter = new ExperimentalEmptyAdapter();

const DEFAULT_RESOURCE_ID = "default-user";

export const POST = async (req: NextRequest) => {
  const runtime = new CopilotRuntime({
    agents: MastraAgent.getLocalAgents({
      mastra,
      resourceId: DEFAULT_RESOURCE_ID,
    }),
  });

  const { handleRequest } = copilotRuntimeNextJSAppRouterEndpoint({
    runtime,
    serviceAdapter,
    endpoint: "/api/copilotkit",
  });

  return handleRequest(req);
};
