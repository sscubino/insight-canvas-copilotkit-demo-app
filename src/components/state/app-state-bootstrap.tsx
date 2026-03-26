"use client";

import { useEffect } from "react";
import { useDatasetWorkflows } from "@/lib/application/dataset-workflows";
import { useSessionBootstrap } from "@/lib/application/session-workflows";

export const AppStateBootstrap = () => {
  const { initializeDatasets } = useDatasetWorkflows();
  useSessionBootstrap();

  useEffect(() => {
    void initializeDatasets();
  }, [initializeDatasets]);

  return null;
};
