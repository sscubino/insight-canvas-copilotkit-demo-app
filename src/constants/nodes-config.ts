import { NodeConfig, NodeVariant } from "@/types/canvas";
import { ChartBarIcon } from "@/icons/chart-bar";
import { CheckCircleIcon } from "@/icons/check-circle";
import { EyeIcon } from "@/icons/eye";
import { EyeglassesIcon } from "@/icons/eyeglasses";
import { FlaskIcon } from "@/icons/flask";
import { QuestionIcon } from "@/icons/question";

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
