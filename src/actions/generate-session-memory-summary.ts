"use server";

import Anthropic from "@anthropic-ai/sdk";
import CONFIG from "@/constants/config";
import { clampText } from "@/lib/utils";

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

const SUMMARY_MAX_LENGTH = 500;

const sanitizeSummary = (input: string): string => {
  const lines = input
    .split(/\r?\n/)
    .map((line) => line.replace(/\s+/g, " ").trim())
    .filter(Boolean);
  const normalized = lines.join("\n");
  return clampText(normalized, SUMMARY_MAX_LENGTH);
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
    "Your reply must be ONLY durable facts for a future session: insights, findings, numbers, decisions, and unresolved questions worth remembering.",
    "Nothing else: no title, no header, no 'Summary', no markdown, no bullets, no numbering, no preamble or sign-off.",
    "Format: plain text, one short sentence per line (one fact per line). No empty lines.",
    "Be specific; skip generic filler. Do not speculate.",
    "Previous summary below is hints only—not authoritative. If the recent conversation disagrees, follow the conversation.",
    "Cap total length around 90 words.",
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

  try {
    const message = await anthropic.messages.create({
      model: CONFIG.ANTHROPIC.FAST_MODEL,
      max_tokens: 220,
      temperature: 0.2,
      system:
        "You output only compact factual memory lines for a data assistant: insights and findings as plain text, one sentence per line, with no headings or extra prose.",
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
  console.log("Generated summary:", generatedSummary);
  return sanitized.length > 0 ? sanitized : null;
};

export { generateSessionMemorySummary };
