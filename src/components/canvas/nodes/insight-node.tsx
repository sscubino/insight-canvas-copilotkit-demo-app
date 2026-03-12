import type { NodeProps } from "@xyflow/react";
import type { InsightCanvasNode } from "@/types/canvas";
import { BaseNode, BaseNodeText } from "@/components/canvas/nodes/base-node";

const InsightNode = ({ data }: NodeProps<InsightCanvasNode>) => {
  return (
    <BaseNode data={data}>
      <BaseNodeText>{data.content}</BaseNodeText>
    </BaseNode>
  );
};

export { InsightNode };
