"use client";

import { useEffect } from "react";
import { useDatasetWorkflows } from "@/lib/workflows/dataset-workflows";
import { useSessionBootstrap } from "@/hooks/use-session-bootstrap";

export const AppStateBootstrap = () => {
  const { initializeDatasets } = useDatasetWorkflows();
  useSessionBootstrap();

  useEffect(() => {
    void initializeDatasets();
  }, [initializeDatasets]);

  return null;
};
