import { ChartNode } from "@/components/canvas/nodes/chart-node";
import { InsightNode } from "@/components/canvas/nodes/insight-node";
import { HypothesisNode } from "@/components/canvas/nodes/hypothesis-node";
import { ExperimentNode } from "@/components/canvas/nodes/experiment-node";
import { ActionItemNode } from "@/components/canvas/nodes/action-item-node";
import { QuestionNode } from "@/components/canvas/nodes/question-node";
import { ChartBarIcon } from "@/components/icons/chart-bar";
import { CheckCircleIcon } from "@/components/icons/check-circle";
import { EyeIcon } from "@/components/icons/eye";
import { EyeglassesIcon } from "@/components/icons/eyeglasses";
import { FlaskIcon } from "@/components/icons/flask";
import { QuestionIcon } from "@/components/icons/question";
import type { NodeConfig, NodeVariant } from "@/types/canvas";
import type { NodeTypes } from "@xyflow/react";

export const NODE_VARIANTS = [
  "chart",
  "insight",
  "hypothesis",
  "experiment",
  "action_item",
  "question",
] as const;

export const NODE_CONFIG: Record<NodeVariant, NodeConfig> = {
  chart: {
    label: "Chart",
    eyebrowClass: "text-lilac",
    wrapperClass: "border-lilac-light",
    icon: ChartBarIcon,
  },
  insight: {
    label: "Insight",
    eyebrowClass: "text-mint",
    wrapperClass: "border-mint-light",
    icon: EyeIcon,
  },
  hypothesis: {
    label: "Hypothesis",
    eyebrowClass: "text-yellow",
    wrapperClass: "border-yellow-light",
    icon: EyeglassesIcon,
  },
  experiment: {
    label: "Experiment",
    eyebrowClass: "text-red",
    wrapperClass: "border-red-light",
    icon: FlaskIcon,
  },
  action_item: {
    label: "Action Item",
    eyebrowClass: "text-blue",
    wrapperClass: "border-blue-light",
    icon: CheckCircleIcon,
  },
  question: {
    label: "Question",
    eyebrowClass: "text-orange",
    wrapperClass: "border-orange-light",
    icon: QuestionIcon,
  },
};

export const NODE_TYPES: NodeTypes = {
  chart: ChartNode,
  insight: InsightNode,
  hypothesis: HypothesisNode,
  experiment: ExperimentNode,
  action_item: ActionItemNode,
  question: QuestionNode,
};
