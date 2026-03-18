import type { NodeProps } from "@xyflow/react";
import type { ActionItemCanvasNode } from "@/types/canvas";
import {
  BaseNode,
  BaseNodeText,
} from "@/components/canvas/nodes/common/base-node";

const ActionItemNode = ({ data }: NodeProps<ActionItemCanvasNode>) => {
  return (
    <BaseNode data={data}>
      <BaseNodeText>{data.content}</BaseNodeText>
    </BaseNode>
  );
};

export { ActionItemNode };
