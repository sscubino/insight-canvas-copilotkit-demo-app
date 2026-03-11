import type { NodeProps } from "@xyflow/react";
import type { InsightCanvasNode } from "@/types/canvas";
import { TextContentNode } from "./text-content-node";

const InsightNode = ({ data }: NodeProps<InsightCanvasNode>) => {
  return <TextContentNode data={data} />;
};

export { InsightNode };
