import type {
  CanvasNodeData,
} from "@/types/canvas";
import { BaseNode } from "./base-node";

type TextContentNodeProps = {
  data: CanvasNodeData & { content: string };
  className?: string;
};

const TextContentNode = ({ data, className }: TextContentNodeProps) => {
  return (
    <BaseNode data={data}>
      <p className={`text-sm leading-snug text-muted ${className ?? ""}`}>
        {data.content}
      </p>
    </BaseNode>
  );
};

export { TextContentNode };
