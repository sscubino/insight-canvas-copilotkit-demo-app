const config = {
  anthropic: {
    fastModel: process.env.ANTHROPIC_FAST_MODEL ?? "claude-haiku-4-5",
  },
  copilotkit: {
    builtInAgentModel:
      process.env.COPILOTKIT_BUILT_IN_AGENT_MODEL ??
      "anthropic/claude-sonnet-4-6",
  },
};

export default config;
