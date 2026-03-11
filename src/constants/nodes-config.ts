import { NodeConfig, NodeVariant } from "@/types/canvas";

export const NODE_CONFIG: Record<NodeVariant, NodeConfig> = {
  chart: {
    label: "Chart",
    colorClass: "text-chart",
    bgClass: "bg-chart-bg",
    borderClass: "border-chart-border",
    dotColor: "bg-chart",
  },
  insight: {
    label: "Insight",
    colorClass: "text-insight",
    bgClass: "bg-insight-bg",
    borderClass: "border-insight-border",
    dotColor: "bg-insight",
  },
  hypothesis: {
    label: "Hypothesis",
    colorClass: "text-hypothesis",
    bgClass: "bg-hypothesis-bg",
    borderClass: "border-hypothesis-border",
    dotColor: "bg-hypothesis",
  },
  experiment: {
    label: "Experiment",
    colorClass: "text-experiment",
    bgClass: "bg-experiment-bg",
    borderClass: "border-experiment-border",
    dotColor: "bg-experiment",
  },
  action_item: {
    label: "Action Item",
    colorClass: "text-action",
    bgClass: "bg-action-bg",
    borderClass: "border-action-border",
    dotColor: "bg-action",
  },
  question: {
    label: "Question",
    colorClass: "text-question",
    bgClass: "bg-question-bg",
    borderClass: "border-question-border",
    dotColor: "bg-question",
  },
};
