import type { NodeProps } from "@xyflow/react";
import type { HypothesisCanvasNode } from "@/types/canvas";
import {
  BaseNode,
  BaseNodeText,
} from "@/components/canvas/nodes/common/base-node";

const HypothesisNode = ({ data }: NodeProps<HypothesisCanvasNode>) => {
  return (
    <BaseNode data={data}>
      <BaseNodeText>{data.content}</BaseNodeText>
    </BaseNode>
  );
};

export { HypothesisNode };
