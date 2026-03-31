"use client";

import { useMemo } from "react";
import { useAppStore } from "@/state/store";

export const useSelectedDatasets = () => {
  const datasets = useAppStore((s) => s.datasets);
  return useMemo(() => datasets.filter((d) => d.isSelected), [datasets]);
};

export const useActiveSchemas = () => {
  const datasets = useAppStore((s) => s.datasets);
  return useMemo(
    () =>
      datasets
        .filter((d) => d.isSelected && d.isLoaded && d.schema)
        .map((d) => d.schema!),
    [datasets]
  );
};
