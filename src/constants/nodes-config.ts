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
    textColorClass: "text-lilac",
    borderClass: "border-lilac-light",
    selectedBorderClass: "border-lilac-selected",
    selectedShadowClass: "shadow-[0px_5px_25px_0px_var(--lilac-selected)]",
    selectedDotClass: "bg-lilac-selected",
    icon: ChartBarIcon,
  },
  insight: {
    label: "Insight",
    textColorClass: "text-mint",
    borderClass: "border-mint-light",
    selectedBorderClass: "border-mint-selected",
    selectedShadowClass: "shadow-[0px_5px_25px_0px_var(--mint-selected)]",
    selectedDotClass: "bg-mint-selected",
    icon: EyeIcon,
  },
  hypothesis: {
    label: "Hypothesis",
    textColorClass: "text-yellow",
    borderClass: "border-yellow-light",
    selectedBorderClass: "border-yellow-selected",
    selectedShadowClass: "shadow-[0px_5px_25px_0px_var(--yellow-selected)]",
    selectedDotClass: "bg-yellow-selected",
    icon: EyeglassesIcon,
  },
  experiment: {
    label: "Experiment",
    textColorClass: "text-red",
    borderClass: "border-red-light",
    selectedBorderClass: "border-red-selected",
    selectedShadowClass: "shadow-[0px_5px_25px_0px_var(--red-selected)]",
    selectedDotClass: "bg-red-selected",
    icon: FlaskIcon,
  },
  action_item: {
    label: "Action Item",
    textColorClass: "text-blue",
    borderClass: "border-blue-light",
    selectedBorderClass: "border-blue-selected",
    selectedShadowClass: "shadow-[0px_5px_25px_0px_var(--blue-selected)]",
    selectedDotClass: "bg-blue-selected",
    icon: CheckCircleIcon,
  },
  question: {
    label: "Question",
    textColorClass: "text-orange",
    borderClass: "border-orange-light",
    selectedBorderClass: "border-orange-selected",
    selectedShadowClass: "shadow-[0px_5px_25px_0px_var(--orange-selected)]",
    selectedDotClass: "bg-orange-selected",
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
