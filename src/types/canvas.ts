import { NODE_VARIANTS } from "@/constants/nodes-config";
import type { Node, Edge } from "@xyflow/react";
import type { ComponentType, SVGProps } from "react";

export type NodeVariant = (typeof NODE_VARIANTS)[number];

export type NodeSource = "agent" | "user";

export type BaseNodeData = {
  variant: NodeVariant;
  title: string;
  createdAt: string;
  source: NodeSource;
};

export type ChartNodeData = BaseNodeData & {
  variant: "chart";
  description?: string;
  fieldsUsed?: string[];
  sourceQuery?: string;
  chartSpec?: Record<string, unknown>;
};

export type InsightNodeData = BaseNodeData & {
  variant: "insight";
  content: string;
};

export type HypothesisNodeData = BaseNodeData & {
  variant: "hypothesis";
  content: string;
};

export type ExperimentNodeData = BaseNodeData & {
  variant: "experiment";
  plan: string;
  expectedOutcome: string;
};

export type ActionItemNodeData = BaseNodeData & {
  variant: "action_item";
  content: string;
};

export type QuestionNodeData = BaseNodeData & {
  variant: "question";
  content: string;
};

export type CanvasNodeData =
  | ChartNodeData
  | InsightNodeData
  | HypothesisNodeData
  | ExperimentNodeData
  | ActionItemNodeData
  | QuestionNodeData;

export type CanvasNode = Node<CanvasNodeData>;
export type ChartCanvasNode = Node<ChartNodeData>;
export type InsightCanvasNode = Node<InsightNodeData>;
export type HypothesisCanvasNode = Node<HypothesisNodeData>;
export type ExperimentCanvasNode = Node<ExperimentNodeData>;
export type ActionItemCanvasNode = Node<ActionItemNodeData>;
export type QuestionCanvasNode = Node<QuestionNodeData>;
export type CanvasEdge = Edge;

export type NodeConfig = {
  label: string;
  textColorClass: string;
  borderClass: string;
  selectedBorderClass: string;
  selectedShadowClass: string;
  selectedDotClass: string;
  pillContainerClass: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
};
