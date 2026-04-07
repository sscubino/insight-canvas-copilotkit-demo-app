import { CUSTOM_USER_MESSAGES_PREFIXES } from "@/constants/chat";
import { isRecord } from "@/lib/utils";
import { Message } from "@copilotkit/react-core/v2";

export const getMessageContentText = (message: Message): string => {
  if (typeof message.content === "string") return message.content;
  if (
    message.content &&
    isRecord(message.content) &&
    "text" in message.content
  ) {
    const content = message.content as { text?: unknown };
    return typeof content.text === "string" ? content.text : "";
  }
  return "";
};

export const getFirstUserPrompt = (messages: Message[]): string => {
  const firstUserMessage = messages.find(
    (message) =>
      message.role === "user" &&
      !CUSTOM_USER_MESSAGES_PREFIXES.some((prefix) =>
        message.id.startsWith(prefix)
      )
  );
  if (!firstUserMessage) return "";
  return getMessageContentText(firstUserMessage).trim();
};
