import type { NodeProps } from "@xyflow/react";
import type { ExperimentCanvasNode } from "@/types/canvas";
import { BaseNode } from "./base-node";

const ExperimentNode = ({ data }: NodeProps<ExperimentCanvasNode>) => {
  return (
    <BaseNode data={data}>
      <p className="text-sm leading-snug text-muted">{data.plan}</p>
      <p className="mt-1 text-sm font-medium leading-snug text-experiment">
        {data.expectedOutcome}
      </p>
    </BaseNode>
  );
};

export { ExperimentNode };
