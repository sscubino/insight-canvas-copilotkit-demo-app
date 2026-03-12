import type { NodeProps } from "@xyflow/react";
import type { QuestionCanvasNode } from "@/types/canvas";
import { BaseNode, BaseNodeText } from "@/components/canvas/nodes/base-node";

const QuestionNode = ({ data }: NodeProps<QuestionCanvasNode>) => {
  return (
    <BaseNode data={data}>
      <BaseNodeText className="italic">{data.content}</BaseNodeText>
    </BaseNode>
  );
};

export { QuestionNode };
