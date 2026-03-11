import type { NodeProps } from "@xyflow/react";
import type { HypothesisCanvasNode } from "@/types/canvas";
import { TextContentNode } from "./text-content-node";

const HypothesisNode = ({ data }: NodeProps<HypothesisCanvasNode>) => {
  return <TextContentNode data={data} />;
};

export { HypothesisNode };
