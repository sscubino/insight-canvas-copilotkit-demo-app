import type { NodeProps } from "@xyflow/react";
import type { ActionItemCanvasNode } from "@/types/canvas";
import { TextContentNode } from "./text-content-node";

const ActionItemNode = ({ data }: NodeProps<ActionItemCanvasNode>) => {
  return <TextContentNode data={data} />;
};

export { ActionItemNode };
