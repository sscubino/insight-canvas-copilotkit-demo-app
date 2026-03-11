import type { CanvasNode, CanvasEdge } from "@/types/canvas";

export const SEED_NODES: CanvasNode[] = [
  {
    id: "chart-1",
    type: "chart",
    position: { x: 80, y: 80 },
    data: {
      variant: "chart",
      title: "Churn by week of life",
      description: "Weekly churn distribution across Q4 cohorts",
      fieldsUsed: ["signup_date", "churned", "weekly_activity"],
      sourceQuery:
        "SELECT DATE_TRUNC('week', signup_date) AS week, COUNT(*) FILTER (WHERE churned) AS churned_count FROM users GROUP BY week",
      createdAt: "2024-12-10T14:31:00Z",
      source: "agent",
    },
  },
  {
    id: "insight-1",
    type: "insight",
    position: { x: 380, y: 180 },
    data: {
      variant: "insight",
      title: "Churn spike in week 3",
      content:
        "40% of churned users leave before day 21. Consistent across Q4 cohorts.",
      createdAt: "2024-12-10T14:32:00Z",
      source: "agent",
    },
  },
  {
    id: "hypothesis-1",
    type: "hypothesis",
    position: { x: 670, y: 280 },
    data: {
      variant: "hypothesis",
      title: "Onboarding doesn't show value",
      content: "Users don't reach the key feature before day 7.",
      createdAt: "2024-12-10T14:33:00Z",
      source: "user",
    },
  },
  {
    id: "experiment-1",
    type: "experiment",
    position: { x: 970, y: 360 },
    data: {
      variant: "experiment",
      title: "A/B: Interactive tutorial",
      plan: "Compare guided onboarding vs current flow for new users.",
      expectedOutcome: "Expected outcome: -15% churn in 30 days.",
      createdAt: "2024-12-10T14:34:00Z",
      source: "agent",
    },
  },
];

export const SEED_EDGES: CanvasEdge[] = [
  {
    id: "edge-chart1-insight1",
    source: "chart-1",
    target: "insight-1",
  },
  {
    id: "edge-insight1-hypothesis1",
    source: "insight-1",
    target: "hypothesis-1",
  },
  {
    id: "edge-hypothesis1-experiment1",
    source: "hypothesis-1",
    target: "experiment-1",
  },
];
