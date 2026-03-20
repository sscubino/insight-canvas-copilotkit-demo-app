import type { NodeProps } from "@xyflow/react";
import type { ChartCanvasNode } from "@/types/canvas";
import { BaseNode } from "@/components/canvas/nodes/base-node";
import { VegaChart } from "@/components/charts/vega-chart";

const ChartNode = ({ data }: NodeProps<ChartCanvasNode>) => {
  return (
    <BaseNode data={data} className="min-w-60">
      <VegaChart
        spec={data.chartSpec}
        className="mt-1.5 flex! justify-center!"
      />
    </BaseNode>
  );
};

export { ChartNode };
