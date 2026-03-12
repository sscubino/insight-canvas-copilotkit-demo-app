import type { NodeProps } from "@xyflow/react";
import type { ChartCanvasNode } from "@/types/canvas";
import { BaseNode, BaseNodeText } from "@/components/canvas/nodes/base-node";

const PLACEHOLDER_BARS = [38, 52, 88, 100, 68, 48, 32];

const ChartNode = ({ data }: NodeProps<ChartCanvasNode>) => {
  return (
    <BaseNode data={data}>
      <div
        className="mt-1.5 flex h-7 items-end gap-0.5"
        role="img"
        aria-label="Bar chart placeholder"
      >
        {PLACEHOLDER_BARS.map((height) => (
          <div
            key={`bar-${data.title}-${height}`}
            className="flex-1 rounded-t-sm bg-chart opacity-55"
            style={{ height: `${height}%` }}
          />
        ))}
      </div>
      {data.description && (
        <BaseNodeText className="mt-2">{data.description}</BaseNodeText>
      )}
    </BaseNode>
  );
};

export { ChartNode };
