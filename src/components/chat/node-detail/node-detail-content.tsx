import { NODE_CONFIG } from "@/constants/nodes-config";
import {
  DrawerSectionLabel,
  DrawerEditableField,
  DrawerTextBlock,
  DrawerConnectedNodes,
  DrawerCard,
} from "@/components/chat/node-detail/drawer-sections";
import { VegaChart } from "@/components/charts/vega-chart";
import type {
  CanvasNode,
  CanvasEdge,
  CanvasNodeData,
  ChartNodeData,
  ExperimentNodeData,
} from "@/types/canvas";

type NodeDetailContentProps = {
  node: CanvasNode;
  nodes: CanvasNode[];
  edges: CanvasEdge[];
  onNodeClick?: (id: string) => void;
};

const getContentText = (data: CanvasNodeData): string | null => {
  if ("content" in data) return data.content;
  if (data.variant === "experiment") return data.plan;
  return null;
};

const ChartSections = ({ data }: { data: ChartNodeData }) => (
  <>
    {data.chartSpec && (
      <div className="flex flex-col gap-2">
        <DrawerCard className="flex justify-center">
          <VegaChart
            spec={data.chartSpec}
            className="w-auto flex justify-center h-auto"
          />
        </DrawerCard>
      </div>
    )}
    {data.description && (
      <div className="flex flex-col gap-2">
        <DrawerSectionLabel>Description</DrawerSectionLabel>
        <DrawerTextBlock>{data.description}</DrawerTextBlock>
      </div>
    )}
    {data.fieldsUsed && data.fieldsUsed.length > 0 && (
      <div className="flex flex-col gap-2">
        <DrawerSectionLabel>Fields Used</DrawerSectionLabel>
        <DrawerTextBlock>{data.fieldsUsed.join(", ")}</DrawerTextBlock>
      </div>
    )}
    {data.sourceQuery && (
      <div className="flex flex-col gap-2">
        <DrawerSectionLabel>Source Query</DrawerSectionLabel>
        <div className="px-1">
          <DrawerCard>
            <pre className="overflow-x-auto whitespace-pre-wrap font-mono text-xs text-muted">
              {data.sourceQuery}
            </pre>
          </DrawerCard>
        </div>
      </div>
    )}
  </>
);

const ExperimentSections = ({ data }: { data: ExperimentNodeData }) => (
  <div className="flex flex-col gap-2">
    <DrawerSectionLabel>Expected Outcome</DrawerSectionLabel>
    <DrawerTextBlock>{data.expectedOutcome}</DrawerTextBlock>
  </div>
);

const NodeDetailContent = ({
  node,
  nodes,
  edges,
  onNodeClick,
}: NodeDetailContentProps) => {
  const { data } = node;
  const config = NODE_CONFIG[data.variant];
  const contentText = getContentText(data);

  return (
    <div className="flex w-full flex-col gap-5">
      <div className="flex flex-col gap-2">
        <DrawerSectionLabel>{config.label}</DrawerSectionLabel>
        {contentText && (
          <DrawerEditableField value={contentText} variant={data.variant} />
        )}
      </div>

      {data.variant === "chart" && <ChartSections data={data} />}
      {data.variant === "experiment" && <ExperimentSections data={data} />}

      <DrawerConnectedNodes
        nodeId={node.id}
        nodes={nodes}
        edges={edges}
        onNodeClick={onNodeClick}
      />
    </div>
  );
};

export { NodeDetailContent };
