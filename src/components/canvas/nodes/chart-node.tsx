import type { NodeProps } from "@xyflow/react";
import type { ChartCanvasNode } from "@/types/canvas";
import { BaseNode } from "@/components/canvas/nodes/common/base-node";
import { VegaChart } from "@/components/charts/vega-chart";

const ChartNode = ({ data, id }: NodeProps<ChartCanvasNode>) => {
  return (
    <BaseNode data={data} id={id} className="w-auto min-w-min">
      <VegaChart
        spec={data.chartSpec}
        className="mt-1.5 flex! justify-center!"
      />
    </BaseNode>
  );
};

export { ChartNode };
