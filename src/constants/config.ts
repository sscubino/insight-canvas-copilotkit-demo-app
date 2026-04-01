const CONFIG = {
  ANTHROPIC: {
    FAST_MODEL: process.env.ANTHROPIC_FAST_MODEL ?? "claude-haiku-4-5",
  },
  COPILOTKIT: {
    BUILT_IN_AGENT_MODEL:
      process.env.COPILOTKIT_BUILT_IN_AGENT_MODEL ??
      "anthropic/claude-sonnet-4-6",
  },
};

export default CONFIG;
