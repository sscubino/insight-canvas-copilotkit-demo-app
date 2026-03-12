import type { NodeProps } from "@xyflow/react";
import type { ExperimentCanvasNode } from "@/types/canvas";
import { BaseNode, BaseNodeText } from "@/components/canvas/nodes/base-node";

const ExperimentNode = ({ data }: NodeProps<ExperimentCanvasNode>) => {
  return (
    <BaseNode data={data}>
      <BaseNodeText>{data.plan}</BaseNodeText>
      <BaseNodeText className="mt-1 font-medium text-experiment">
        {data.expectedOutcome}
      </BaseNodeText>
    </BaseNode>
  );
};

export { ExperimentNode };
