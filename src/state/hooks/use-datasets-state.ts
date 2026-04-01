"use client";

import { useMemo } from "react";
import { useAppStore } from "@/state/store";

export const useDatasetsState = () => {
  const datasets = useAppStore((state) => state.datasets);
  const isDatasetsInitialized = useAppStore(
    (state) => state.isDatasetsInitialized
  );

  const selectedDatasets = useMemo(
    () => datasets.filter((dataset) => dataset.isSelected),
    [datasets]
  );
  const activeSchemas = useMemo(
    () =>
      selectedDatasets
        .filter((dataset) => dataset.isLoaded && dataset.schema)
        .map((dataset) => dataset.schema!),
    [selectedDatasets]
  );

  return {
    datasets,
    selectedDatasets,
    activeSchemas,
    isDatasetsInitialized,
  };
};
