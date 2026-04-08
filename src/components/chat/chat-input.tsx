"use client";

import React, {
  useState,
  useRef,
  useEffect,
  forwardRef,
  useImperativeHandle,
  useMemo,
} from "react";
import { useChatContext } from "@copilotkit/react-ui";
import {
  useCopilotContext,
  useCopilotChatInternal,
} from "@copilotkit/react-core";
import type { InputProps } from "@copilotkit/react-ui";
import { PaperclipIcon } from "@/components/icons/paperclip";
import { Button } from "@/components/ui/button";
import { useAppStore } from "@/state/store";
import { clampText, cn } from "@/lib/utils";
import { useShallow } from "zustand/react/shallow";

// Copied from @copilotkit/react-ui — not publicly exported
interface AutoResizingTextareaProps {
  maxRows?: number;
  placeholder?: string;
  value: string;
  onChange: (event: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onKeyDown?: (event: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  onCompositionStart?: () => void;
  onCompositionEnd?: () => void;
  autoFocus?: boolean;
}

const AutoResizingTextarea = forwardRef<
  HTMLTextAreaElement,
  AutoResizingTextareaProps
>(
  (
    {
      maxRows = 1,
      placeholder,
      value,
      onChange,
      onKeyDown,
      onCompositionStart,
      onCompositionEnd,
      autoFocus,
    },
    ref
  ) => {
    const internalRef = useRef<HTMLTextAreaElement>(null);
    const [maxHeight, setMaxHeight] = useState<number>(0);

    useImperativeHandle(ref, () => internalRef.current as HTMLTextAreaElement);

    useEffect(() => {
      const textarea = internalRef.current;
      if (textarea) {
        textarea.style.height = "auto";
        setMaxHeight(textarea.scrollHeight * maxRows);
        if (autoFocus) textarea.focus();
      }
    }, [maxRows, autoFocus]);

    useEffect(() => {
      const textarea = internalRef.current;
      if (textarea) {
        textarea.style.height = "auto";
        textarea.style.height = `${Math.min(textarea.scrollHeight, maxHeight)}px`;
      }
    }, [value, maxHeight]);

    return (
      <textarea
        ref={internalRef}
        value={value}
        onChange={onChange}
        onKeyDown={onKeyDown}
        onCompositionStart={onCompositionStart}
        onCompositionEnd={onCompositionEnd}
        placeholder={placeholder}
        style={{
          overflow: "auto",
          resize: "none",
          maxHeight: `${maxHeight}px`,
        }}
        rows={1}
      />
    );
  }
);
AutoResizingTextarea.displayName = "AutoResizingTextarea";

const MAX_NEWLINES = 6;

type ChatInputProps = InputProps & {
  onToggleDrawer: () => void;
};

const ChatInput = ({
  inProgress,
  onSend,
  chatReady = false,
  onStop,
  hideStopButton = false,
  onToggleDrawer,
}: ChatInputProps) => {
  const context = useChatContext();
  const copilotContext = useCopilotContext();
  const { interrupt } = useCopilotChatInternal();
  const selectedDatasets = useAppStore(
    useShallow((s) => s.datasets.filter((d) => d.isSelected))
  );

  const showPoweredBy = !copilotContext.copilotApiConfig?.publicApiKey;

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [text, setText] = useState("");
  const [isComposing, setIsComposing] = useState(false);

  const selectedDatasetsCount = selectedDatasets.length;
  const firstSelectedDatasetName = selectedDatasets[0]?.name || null;
  const otherSelectedDatasetsNames = selectedDatasets
    .slice(1)
    .map((d) => d.name)
    .join(", ");

  const handleDivClick = (event: React.MouseEvent<HTMLDivElement>) => {
    const target = event.target as HTMLElement;
    if (target.closest("button") || target.tagName === "TEXTAREA") return;
    textareaRef.current?.focus();
  };

  const send = () => {
    if (inProgress) return;
    onSend(text);
    setText("");
    textareaRef.current?.focus();
  };

  const canSend = useMemo(
    () => !inProgress && text.trim().length > 0 && !interrupt,
    [inProgress, text, interrupt]
  );

  const canStop = useMemo(
    () => inProgress && !hideStopButton,
    [inProgress, hideStopButton]
  );

  const sendDisabled = !canSend && !canStop;

  const { buttonIcon, buttonAlt } = useMemo(() => {
    if (!chatReady)
      return { buttonIcon: context.icons.spinnerIcon, buttonAlt: "Loading" };
    return inProgress && !hideStopButton && chatReady
      ? { buttonIcon: context.icons.stopIcon, buttonAlt: "Stop" }
      : { buttonIcon: context.icons.sendIcon, buttonAlt: "Send" };
  }, [inProgress, chatReady, hideStopButton, context.icons]);

  return (
    <div
      className={`copilotKitInputContainer ${showPoweredBy ? "poweredByContainer" : ""}`}
    >
      <div className="copilotKitInput" onClick={handleDivClick}>
        <AutoResizingTextarea
          ref={textareaRef}
          placeholder={context.labels.placeholder}
          autoFocus={false}
          maxRows={MAX_NEWLINES}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onCompositionStart={() => setIsComposing(true)}
          onCompositionEnd={() => setIsComposing(false)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey && !isComposing) {
              e.preventDefault();
              if (canSend) send();
            }
          }}
        />
        <div className="copilotKitInputControls">
          <Button
            onClick={onToggleDrawer}
            className="copilotKitInputControlButton border border-border"
            aria-label="Open datasets"
            size="sm-icon"
          >
            <PaperclipIcon width={18} height={18} />
          </Button>
          {firstSelectedDatasetName && (
            <>
              <Button
                onClick={onToggleDrawer}
                className={cn(
                  "max-w-50 block border border-border truncate",
                  otherSelectedDatasetsNames && "max-w-40"
                )}
                title={firstSelectedDatasetName}
                size="sm"
              >
                {firstSelectedDatasetName}
              </Button>
              {otherSelectedDatasetsNames && (
                <Button
                  onClick={onToggleDrawer}
                  className="shrink-0 border border-border"
                  size="sm"
                  title={clampText(otherSelectedDatasetsNames, 40)}
                >
                  +{selectedDatasetsCount - 1} more
                </Button>
              )}
            </>
          )}
          <div style={{ flexGrow: 1 }} />
          <button
            disabled={sendDisabled}
            onClick={inProgress && !hideStopButton ? onStop : send}
            data-copilotkit-in-progress={inProgress}
            data-test-id={
              inProgress
                ? "copilot-chat-request-in-progress"
                : "copilot-chat-ready"
            }
            className="copilotKitInputControlButton"
            aria-label={buttonAlt}
          >
            {buttonIcon}
          </button>
        </div>
      </div>
      <div className="copilotKitPoweredBy">
        {showPoweredBy && <p className="poweredBy">Powered by CopilotKit</p>}
      </div>
    </div>
  );
};

export { ChatInput };
export type { ChatInputProps };
