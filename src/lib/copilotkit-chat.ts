import { useCopilotChatInternal } from "@copilotkit/react-core";

export type ChatMessages = ReturnType<
  typeof useCopilotChatInternal
>["messages"];

export const getMessageContentText = (
  message: ChatMessages[number]
): string => {
  if (typeof message.content === "string") return message.content;
  if (
    message.content &&
    typeof message.content === "object" &&
    "text" in message.content
  ) {
    const content = message.content as { text?: unknown };
    return typeof content.text === "string" ? content.text : "";
  }
  return "";
};

export const getFirstUserPrompt = (messages: ChatMessages): string => {
  const firstUserMessage = messages.find((message) => message.role === "user");
  if (!firstUserMessage) return "";
  return getMessageContentText(firstUserMessage).trim();
};

/** Plain text from an AG-UI user message (v2 CopilotChat / useAgent). */
export const getAgUiUserMessageText = (message: {
  role: string;
  content: unknown;
}): string => {
  if (message.role !== "user") return "";
  const { content } = message;
  if (typeof content === "string") return content;
  if (!Array.isArray(content)) return "";
  return content
    .filter(
      (part): part is { type: "text"; text: string } =>
        typeof part === "object" &&
        part !== null &&
        "type" in part &&
        part.type === "text" &&
        "text" in part &&
        typeof (part as { text: unknown }).text === "string"
    )
    .map((part) => part.text)
    .join("");
};
