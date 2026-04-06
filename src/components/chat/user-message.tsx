import {
  UserMessage as DefaultUserMessage,
  type UserMessageProps,
} from "@copilotkit/react-ui";
import { NODE_CONFIG } from "@/constants/nodes-config";
import type { CanvasNodeData, NodeVariant } from "@/types/canvas";
import type { DatasetInfo, DatasetSource } from "@/types/dataset";
import { ArrowDownIcon } from "@/components/icons/arrow-down";
import { DatasetCard } from "@/components/chat/datasets/dataset-card";
import { noop } from "@/lib/utils";
import {
  USER_EDIT_PREFIX,
  CANVAS_EDIT_MARKER,
  DATASET_SELECTION_PREFIX,
  DATASET_SELECTION_MARKER,
} from "@/constants/chat";

type CanvasEditPayload = {
  type: "canvas-edit";
  title: string;
  variant: NodeVariant;
  previousText: string;
  newText: string;
};

const getNodeContentText = (data: CanvasNodeData): string | null => {
  if ("content" in data) return data.content;
  if (data.variant === "experiment") return data.plan;
  return null;
};

const buildCanvasEditPayload = (
  payload: Omit<CanvasEditPayload, "type">
): string => JSON.stringify({ type: "canvas-edit", ...payload });

const parseCanvasEditPayload = (content: unknown): CanvasEditPayload | null => {
  if (typeof content !== "string") return null;
  if (!content.includes(CANVAS_EDIT_MARKER)) return null;
  try {
    const parsed = JSON.parse(content) as CanvasEditPayload;
    if (parsed.type !== "canvas-edit") return null;
    return parsed;
  } catch {
    return null;
  }
};

const DiffCard = ({
  text,
  kind,
}: {
  text: string;
  kind: "removed" | "added";
}) => {
  const isRemoved = kind === "removed";

  return (
    <div
      className={`rounded-lg border-l-[3px] px-3 py-2.5 text-sm leading-relaxed ${
        isRemoved
          ? "border-red bg-red-light/20 text-foreground"
          : "border-mint bg-mint-light/20 text-foreground"
      }`}
      role="status"
      aria-label={isRemoved ? "Previous version" : "New version"}
    >
      {text}
    </div>
  );
};

const CanvasEditMessage = ({ payload }: { payload: CanvasEditPayload }) => {
  const config = NODE_CONFIG[payload.variant];
  const label = config?.label ?? payload.variant;

  return (
    <section
      className="flex flex-col gap-2.5 rounded-xl bg-surface-hover/60 px-4 py-3"
      aria-label={`You edited the ${label}`}
    >
      <p className="text-sm font-medium text-foreground">
        You edited the {label}
      </p>
      <DiffCard text={payload.previousText} kind="removed" />
      <div className="flex justify-center">
        <ArrowDownIcon
          width={14}
          height={14}
          className="text-foreground"
          aria-hidden="true"
        />
      </div>
      <DiffCard text={payload.newText} kind="added" />
    </section>
  );
};

type DatasetSelectionPayload = {
  type: "dataset-selection";
  datasets: Array<{
    id: string;
    name: string;
    fileName: string;
    tableName: string;
    source: DatasetSource;
    emoji?: string;
    rowCount?: number;
    columnCount?: number;
  }>;
};

const buildDatasetSelectionPayload = (datasets: DatasetInfo[]): string =>
  JSON.stringify({
    type: "dataset-selection",
    datasets: datasets.map(
      ({
        id,
        name,
        fileName,
        tableName,
        source,
        emoji,
        rowCount,
        columnCount,
      }) => ({
        id,
        name,
        fileName,
        tableName,
        source,
        emoji,
        rowCount,
        columnCount,
      })
    ),
  });

const parseDatasetSelectionPayload = (
  content: unknown
): DatasetSelectionPayload | null => {
  if (typeof content !== "string") return null;
  if (!content.includes(DATASET_SELECTION_MARKER)) return null;
  try {
    const parsed = JSON.parse(content) as DatasetSelectionPayload;
    if (parsed.type !== "dataset-selection") return null;
    return parsed;
  } catch {
    return null;
  }
};

const DatasetSelectionMessage = ({
  payload,
}: {
  payload: DatasetSelectionPayload;
}) => {
  const count = payload.datasets.length;

  return (
    <section
      className="flex flex-col gap-2.5 rounded-xl bg-surface-50 px-4 py-3 mb-2"
      aria-label={`You selected ${count} dataset${count !== 1 ? "s" : ""}`}
    >
      <p className="text-sm font-medium text-foreground">
        You selected {count} dataset{count !== 1 ? "s" : ""}
      </p>
      <div className="flex flex-col gap-2">
        {payload.datasets.map((d) => (
          <DatasetCard
            key={d.id}
            dataset={{
              ...d,
              isSelected: true,
              isLoaded: true,
              format: "csv",
              schema: null,
            }}
            onToggle={noop}
          />
        ))}
      </div>
    </section>
  );
};

const UserMessage = (props: UserMessageProps) => {
  if (props.message?.id?.startsWith(USER_EDIT_PREFIX)) {
    const payload = parseCanvasEditPayload(props.message.content);
    if (payload) return <CanvasEditMessage payload={payload} />;
  }
  if (props.message?.id?.startsWith(DATASET_SELECTION_PREFIX)) {
    const payload = parseDatasetSelectionPayload(props.message.content);
    if (payload) return <DatasetSelectionMessage payload={payload} />;
  }
  return <DefaultUserMessage {...props} />;
};

export {
  UserMessage,
  USER_EDIT_PREFIX,
  buildCanvasEditPayload,
  buildDatasetSelectionPayload,
  getNodeContentText,
};
