import type { NodeProps } from "@xyflow/react";
import type { QuestionCanvasNode } from "@/types/canvas";
import { TextContentNode } from "./text-content-node";

const QuestionNode = ({ data }: NodeProps<QuestionCanvasNode>) => {
  return <TextContentNode data={data} className="italic" />;
};

export { QuestionNode };
