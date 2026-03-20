import type { NodeProps } from "@xyflow/react";
import type { QuestionCanvasNode } from "@/types/canvas";
import {
  BaseNode,
  BaseNodeText,
} from "@/components/canvas/nodes/common/base-node";

const QuestionNode = ({ data, id }: NodeProps<QuestionCanvasNode>) => {
  return (
    <BaseNode data={data} id={id}>
      <BaseNodeText className="italic">{data.content}</BaseNodeText>
    </BaseNode>
  );
};

export { QuestionNode };
