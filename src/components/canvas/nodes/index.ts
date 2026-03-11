import type { NodeTypes } from "@xyflow/react";
import { ChartNode } from "./chart-node";
import { InsightNode } from "./insight-node";
import { HypothesisNode } from "./hypothesis-node";
import { ExperimentNode } from "./experiment-node";
import { ActionItemNode } from "./action-item-node";
import { QuestionNode } from "./question-node";

export const nodeTypes: NodeTypes = {
  chart: ChartNode,
  insight: InsightNode,
  hypothesis: HypothesisNode,
  experiment: ExperimentNode,
  action_item: ActionItemNode,
  question: QuestionNode,
};
