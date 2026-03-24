"use server";

import Anthropic from "@anthropic-ai/sdk";

type GenerateSessionTitleInput = {
  firstPrompt: string;
  selectedDatasets: string[];
};

const TITLE_MAX_LENGTH = 48;

const sanitizeTitle = (input: string): string => {
  const normalized = input.replace(/["`]/g, "").replace(/\s+/g, " ").trim();
  if (normalized.length === 0) return "New analysis";
  if (normalized.length <= TITLE_MAX_LENGTH) return normalized;
  return `${normalized.slice(0, TITLE_MAX_LENGTH - 3).trimEnd()}...`;
};

const buildPrompt = (
  firstPrompt: string,
  selectedDatasets: string[]
): string => {
  const datasetsText =
    selectedDatasets.length > 0
      ? selectedDatasets.join(", ")
      : "No datasets selected";

  return [
    "Create a short session title for a data analysis chat.",
    "Rules:",
    "- Return only the title text.",
    "- Max 6 words.",
    "- No punctuation at the end.",
    "- Be specific to the analysis intent and datasets.",
    `Datasets: ${datasetsText}`,
    `First user prompt: ${firstPrompt}`,
  ].join("\n");
};

const getAnthropicTitle = async (prompt: string): Promise<string | null> => {
  const anthropic = new Anthropic();
  const model = process.env.SESSION_TITLE_ANTHROPIC_MODEL ?? "claude-haiku-4-5";

  try {
    const message = await anthropic.messages.create({
      model,
      max_tokens: 40,
      temperature: 0.3,
      system: "You generate concise titles for analytics sessions.",
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
  input: GenerateSessionTitleInput
): GenerateSessionTitleInput => {
  return {
    firstPrompt: input.firstPrompt.trim(),
    selectedDatasets: input.selectedDatasets,
  };
};

const generateSessionTitle = async (
  input: GenerateSessionTitleInput
): Promise<string> => {
  const normalized = normalizeInput(input);
  if (!normalized.firstPrompt) return "New analysis";

  const prompt = buildPrompt(
    normalized.firstPrompt,
    normalized.selectedDatasets
  );
  const generatedTitle = await getAnthropicTitle(prompt);
  const fallback = sanitizeTitle(normalized.firstPrompt);
  return sanitizeTitle(generatedTitle ?? fallback);
};

export { generateSessionTitle };
