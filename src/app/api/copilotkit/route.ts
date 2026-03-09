import {
  CopilotRuntime,
  copilotRuntimeNextJSAppRouterEndpoint,
  AnthropicAdapter,
} from "@copilotkit/runtime";
import Anthropic from "@anthropic-ai/sdk";

const anthropicClient = new Anthropic({
  baseURL: "https://api.anthropic.com/v1",
});

const serviceAdapter = new AnthropicAdapter({
  anthropic: anthropicClient,
  model: "claude-sonnet-4-20250514",
});

const runtime = new CopilotRuntime();

export const POST = async (req: Request) => {
  const { handleRequest } = copilotRuntimeNextJSAppRouterEndpoint({
    runtime,
    serviceAdapter,
    endpoint: "/api/copilotkit",
  });

  return handleRequest(req);
};
