import type { NodeProps } from "@xyflow/react";
import type { InsightCanvasNode } from "@/types/canvas";
import {
  BaseNode,
  BaseNodeText,
} from "@/components/canvas/nodes/common/base-node";

const InsightNode = ({ data, id }: NodeProps<InsightCanvasNode>) => {
  return (
    <BaseNode data={data} id={id}>
      <BaseNodeText>{data.content}</BaseNodeText>
    </BaseNode>
  );
};

export { InsightNode };
