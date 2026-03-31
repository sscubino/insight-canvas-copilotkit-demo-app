"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { cn } from "@/lib/utils";
import { NODE_CONFIG } from "@/constants/nodes-config";
import { PencilSimpleIcon } from "@/components/icons/pencil-simple";
import { CheckIcon } from "@/components/icons/check";
import { XIcon } from "@/components/icons/x";
import { CaretLeftIcon } from "@/components/icons/caret-left";
import { Button } from "@/components/ui/button";
import type { CanvasNode, NodeVariant } from "@/types/canvas";

type DrawerSectionLabelProps = {
  children: ReactNode;
  className?: string;
};

const DrawerSectionLabel = ({
  children,
  className,
}: DrawerSectionLabelProps) => (
  <p className={cn("px-3 font-medium text-xs text-dim uppercase", className)}>
    {children}
  </p>
);

type DrawerCardProps = {
  children: ReactNode;
  className?: string;
};

const DrawerCard = ({ children, className }: DrawerCardProps) => (
  <div
    className={cn(
      "rounded-2xl border-2 border-white/70 bg-surface-50 p-3 shadow-[0px_5px_25px_0px_rgba(0,0,0,0.03)]",
      className
    )}
  >
    {children}
  </div>
);

type DrawerEditableFieldProps = {
  value: string;
  variant: NodeVariant;
  onConfirmEdit?: (value: string) => void;
};

const DrawerEditableField = ({
  value,
  variant,
  onConfirmEdit,
}: DrawerEditableFieldProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [draftValue, setDraftValue] = useState(value);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleTextareaResize = useCallback(() => {
    const textarea = textareaRef.current;

    if (!textarea) return;

    textarea.style.height = "auto";
    textarea.style.height = `${textarea.scrollHeight}px`;
  }, []);

  const handleStartEdit = () => {
    setDraftValue(value);
    setIsEditing(true);
  };

  const handleCancel = () => {
    setDraftValue(value);
    setIsEditing(false);
  };

  const handleConfirm = () => {
    if (draftValue !== value) onConfirmEdit?.(draftValue);
    setIsEditing(false);
  };

  useEffect(() => {
    setDraftValue(value);
  }, [value]);

  useEffect(() => {
    if (!isEditing) return;
    handleTextareaResize();
  }, [draftValue, handleTextareaResize, isEditing]);

  return (
    <div className="flex items-start gap-2.5">
      <DrawerCard className="flex-1">
        <div
          className={cn(
            "min-h-9 rounded-lg border px-2 py-1",
            NODE_CONFIG[variant].pillContainerClass,
            isEditing && "bg-surface-50 border-border"
          )}
        >
          {isEditing ? (
            <textarea
              ref={textareaRef}
              value={draftValue}
              className="w-full resize-none overflow-hidden bg-transparent text-base leading-6 text-muted outline-none flex"
              rows={1}
              aria-label="Edit field"
              onInput={handleTextareaResize}
              onChange={(event) => setDraftValue(event.target.value)}
            />
          ) : (
            <p className="text-base leading-6 text-muted">{value}</p>
          )}
        </div>
      </DrawerCard>

      {isEditing ? (
        <div className="flex flex-col gap-1 pt-3">
          <Button
            size="icon"
            variant="secondary"
            onClick={handleConfirm}
            aria-label="Confirm edit"
            className="border border-border"
          >
            <CheckIcon width={16} height={16} />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            onClick={handleCancel}
            aria-label="Cancel edit"
          >
            <XIcon width={16} height={16} />
          </Button>
        </div>
      ) : (
        <Button
          size="icon"
          variant="secondary"
          onClick={handleStartEdit}
          aria-label="Edit"
          className="mt-3 border border-border"
        >
          <PencilSimpleIcon width={16} height={16} />
        </Button>
      )}
    </div>
  );
};

type DrawerTextBlockProps = {
  children: ReactNode;
  className?: string;
};

const DrawerTextBlock = ({ children, className }: DrawerTextBlockProps) => (
  <div className={cn("px-2", className)}>
    <p className="text-base leading-6 text-foreground">{children}</p>
  </div>
);

type DrawerConnectedNodesProps = {
  incomingNodes: CanvasNode[];
  outgoingNodes: CanvasNode[];
  onNodeClick?: (id: string) => void;
};

const CONNECTED_NODE_BORDER: Record<NodeVariant, string> = {
  chart: "border-lilac-light/30",
  insight: "border-mint-light/30",
  hypothesis: "border-yellow-light/30",
  experiment: "border-red-light/30",
  action_item: "border-blue-light/30",
  question: "border-orange-light/30",
};

type ConnectedNodeItemProps = {
  node: CanvasNode;
  direction: "incoming" | "outgoing";
  onNodeClick?: (id: string) => void;
};

const ConnectedNodeItem = ({
  node,
  direction,
  onNodeClick,
}: ConnectedNodeItemProps) => {
  const config = NODE_CONFIG[node.data.variant];

  return (
    <button
      type="button"
      onClick={() => onNodeClick?.(node.id)}
      className={cn(
        "flex min-h-9 w-full items-start rounded-lg border bg-surface px-2 py-1 text-left transition-colors hover:bg-surface-hover",
        CONNECTED_NODE_BORDER[node.data.variant]
      )}
      aria-label={`Go to ${config.label}: ${node.data.title}`}
    >
      <p className={cn("text-base leading-6", config.textColorClass)}>
        <CaretLeftIcon
          width={14}
          height={14}
          className={cn(
            "mr-1 inline-block",
            direction === "outgoing" && "rotate-180"
          )}
          aria-hidden="true"
        />
        {config.label}: {node.data.title}
      </p>
    </button>
  );
};

const DrawerConnectedNodes = ({
  incomingNodes,
  outgoingNodes,
  onNodeClick,
}: DrawerConnectedNodesProps) => {
  if (incomingNodes.length === 0 && outgoingNodes.length === 0) return null;

  return (
    <div className="flex flex-col gap-2">
      <DrawerSectionLabel>Connected Nodes</DrawerSectionLabel>
      <div className="px-1">
        <DrawerCard className="flex flex-col gap-2">
          {incomingNodes.map((node) => (
            <ConnectedNodeItem
              key={node.id}
              node={node}
              direction="incoming"
              onNodeClick={onNodeClick}
            />
          ))}
          {outgoingNodes.map((node) => (
            <ConnectedNodeItem
              key={node.id}
              node={node}
              direction="outgoing"
              onNodeClick={onNodeClick}
            />
          ))}
        </DrawerCard>
      </div>
    </div>
  );
};

export {
  DrawerSectionLabel,
  DrawerCard,
  DrawerEditableField,
  DrawerTextBlock,
  DrawerConnectedNodes,
};
