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
