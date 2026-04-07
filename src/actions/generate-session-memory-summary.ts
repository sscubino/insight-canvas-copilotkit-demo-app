"use server";

import Anthropic from "@anthropic-ai/sdk";
import CONFIG from "@/constants/config";
import { clampText } from "@/lib/utils";
import type { SessionSummaryContext } from "@/lib/session-memory";

const SUMMARY_MAX_LENGTH = 280;

const SYSTEM_PROMPT = `\
You are a memory distiller for a data analysis assistant.
After each session, you write a single compact paragraph of dot-separated sentences capturing only what is worth remembering: findings, confirmed insights, key numbers, and open hypotheses. Nothing else.

Rules:
- One paragraph, sentences separated by ". "
- 40–60 words maximum
- Only durable facts from this session — no filler, no session metadata, no agent narration
- If a previous summary exists, treat it as a hint; the conversation takes priority`;

const buildUserMessage = (input: SessionSummaryContext): string => {
  const nodesText =
    input.relevantNodes.length > 0
      ? input.relevantNodes
          .map((n) => `${n.variant}: ${n.title} — ${n.content}`)
          .join("\n")
      : "None";

  const conversationText =
    input.recentConversation.length > 0
      ? input.recentConversation
          .map((m) => `${m.role}: ${m.content}`)
          .join("\n")
      : "None";

  return [
    `First prompt: ${input.firstPrompt || "None"}`,
    "",
    "Canvas findings:",
    nodesText,
    "",
    `Previous summary: ${input.previousSummary || "None"}`,
    "",
    "Recent conversation:",
    conversationText,
    "Generate an updated summary of the session based on the above information, following the rules provided.",
  ].join("\n");
};

const generateSessionMemorySummary = async (
  input: SessionSummaryContext
): Promise<string | null> => {
  const anthropic = new Anthropic();

  try {
    const message = await anthropic.messages.create({
      model: CONFIG.ANTHROPIC.FAST_MODEL,
      max_tokens: 110,
      temperature: 0.3,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: buildUserMessage(input) }],
    });

    const text = message.content.find((c) => c.type === "text")?.text?.trim();
    if (!text) return null;

    const sanitized = clampText(
      text.replace(/\s+/g, " ").trim(),
      SUMMARY_MAX_LENGTH
    );
    return sanitized.length > 0 ? sanitized : null;
  } catch {
    return null;
  }
};

export { generateSessionMemorySummary };
