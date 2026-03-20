export type SampleDatasetConfig = {
  id: string;
  name: string;
  fileName: string;
  filePath: string;
  tableName: string;
  emoji: string;
  rows: number;
  cols: number;
};

export const SAMPLE_DATASETS: SampleDatasetConfig[] = [
  {
    id: "saas-churn",
    name: "SaaS Churn Dataset",
    fileName: "saas-churn.csv",
    filePath: "/data/saas-churn.csv",
    tableName: "saas_churn",
    emoji: "📊",
    rows: 300,
    cols: 7,
  },
  {
    id: "retail-complete",
    name: "E-commerce Retention",
    fileName: "retail_complete.csv",
    filePath: "/data/retail_complete.csv",
    tableName: "retail_complete",
    emoji: "📈",
    rows: 250,
    cols: 10,
  },
  {
    id: "pipeline-q4",
    name: "B2B Pipeline Analysis",
    fileName: "pipeline_q4.csv",
    filePath: "/data/pipeline_q4.csv",
    tableName: "pipeline_q4",
    emoji: "🏢",
    rows: 200,
    cols: 10,
  },
];
