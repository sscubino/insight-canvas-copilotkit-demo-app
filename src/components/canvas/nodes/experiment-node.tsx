import type { NodeProps } from "@xyflow/react";
import type { ExperimentCanvasNode } from "@/types/canvas";
import {
  BaseNode,
  BaseNodeSubtitle,
  BaseNodeText,
} from "@/components/canvas/nodes/common/base-node";

const ExperimentNode = ({ data, id }: NodeProps<ExperimentCanvasNode>) => {
  return (
    <BaseNode data={data} id={id}>
      <BaseNodeText>{data.plan}</BaseNodeText>
      <BaseNodeSubtitle>Expected outcome</BaseNodeSubtitle>
      <BaseNodeText>{data.expectedOutcome}</BaseNodeText>
    </BaseNode>
  );
};

export { ExperimentNode };
