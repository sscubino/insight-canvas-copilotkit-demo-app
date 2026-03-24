"use server";

import Anthropic from "@anthropic-ai/sdk";

type GenerateSessionMemorySummaryInput = {
  firstPrompt: string;
  selectedDatasets: string[];
  previousSummary?: string;
  recentConversation: Array<{
    role: "user" | "assistant";
    content: string;
  }>;
  recentNodeTitles: string[];
};

const SUMMARY_MAX_LENGTH = 480;

const sanitizeSummary = (input: string): string => {
  const normalized = input.replace(/\s+/g, " ").trim();
  if (normalized.length <= SUMMARY_MAX_LENGTH) return normalized;
  return `${normalized.slice(0, SUMMARY_MAX_LENGTH - 3).trimEnd()}...`;
};

const normalizeConversation = (
  conversation: GenerateSessionMemorySummaryInput["recentConversation"]
) => {
  return conversation
    .map((message) => ({
      role: message.role,
      content: message.content.replace(/\s+/g, " ").trim(),
    }))
    .filter((message) => message.content.length > 0);
};

const buildPrompt = (input: GenerateSessionMemorySummaryInput): string => {
  const datasetsText =
    input.selectedDatasets.length > 0
      ? input.selectedDatasets.join(", ")
      : "No datasets selected";
  const nodesText =
    input.recentNodeTitles.length > 0
      ? input.recentNodeTitles.join(" | ")
      : "No canvas nodes";
  const conversationText =
    input.recentConversation.length > 0
      ? input.recentConversation
          .map((message) => `${message.role}: ${message.content}`)
          .join("\n")
      : "No recent conversation";

  return [
    "Create a concise cross-session memory summary for a data analysis chat.",
    "The summary must help the assistant continue future sessions with context.",
    "Rules:",
    "- Return plain text only.",
    "- Focus on analysis goal, key findings, decisions, and unresolved questions.",
    "- Avoid generic phrasing and avoid speculation.",
    "- Use previous summary only as context, not as source of truth.",
    "- If recent conversation conflicts with previous summary, prioritize recent conversation.",
    "- Keep under 90 words.",
    "",
    `First user prompt: ${input.firstPrompt || "No prompt available"}`,
    `Selected datasets: ${datasetsText}`,
    `Recent canvas nodes: ${nodesText}`,
    `Previous summary: ${input.previousSummary || "No previous summary"}`,
    "Recent conversation:",
    conversationText,
  ].join("\n");
};

const getAnthropicSummary = async (prompt: string): Promise<string | null> => {
  const anthropic = new Anthropic();
  const model =
    process.env.SESSION_MEMORY_ANTHROPIC_MODEL ?? "claude-haiku-4-5";

  try {
    const message = await anthropic.messages.create({
      model,
      max_tokens: 220,
      temperature: 0.2,
      system:
        "You generate factual cross-session memory summaries for analytics assistants.",
      messages: [{ role: "user", content: prompt }],
    });
    const textContent = message.content.find(
      (chunk) => chunk.type === "text"
    )?.text;
    return textContent?.trim() ?? null;
  } catch {
    return null;
  }
};

const normalizeInput = (
  input: GenerateSessionMemorySummaryInput
): GenerateSessionMemorySummaryInput => {
  return {
    firstPrompt: input.firstPrompt.trim(),
    selectedDatasets: input.selectedDatasets,
    previousSummary: input.previousSummary?.trim(),
    recentConversation: normalizeConversation(input.recentConversation),
    recentNodeTitles: input.recentNodeTitles
      .map((title) => title.trim())
      .filter(Boolean),
  };
};

const generateSessionMemorySummary = async (
  input: GenerateSessionMemorySummaryInput
): Promise<string | null> => {
  const normalized = normalizeInput(input);
  const prompt = buildPrompt(normalized);
  const generatedSummary = await getAnthropicSummary(prompt);
  if (!generatedSummary) return null;

  const sanitized = sanitizeSummary(generatedSummary);
  return sanitized.length > 0 ? sanitized : null;
};

export { generateSessionMemorySummary };
