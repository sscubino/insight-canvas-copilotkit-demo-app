import type { DatasetInfo } from "@/types/dataset";
import type { StateCreator } from "zustand";
import type { AppStore } from "@/state/store";

export type DatasetsSlice = {
  datasets: DatasetInfo[];
  isDatasetsInitialized: boolean;
  setDatasets: (
    next: DatasetInfo[] | ((prev: DatasetInfo[]) => DatasetInfo[])
  ) => void;
  appendDatasets: (datasets: DatasetInfo[]) => void;
  upsertDataset: (dataset: DatasetInfo) => void;
  removeDatasetById: (id: string) => void;
  toggleDatasetSelection: (id: string) => void;
  setSelectedDatasetIds: (datasetIds: string[]) => void;
  setIsDatasetsInitialized: (isInitialized: boolean) => void;
};

export const createDatasetsSlice: StateCreator<
  AppStore,
  [],
  [],
  DatasetsSlice
> = (set) => ({
  datasets: [],
  isDatasetsInitialized: false,
  setDatasets: (next) => {
    set((state) => ({
      datasets: typeof next === "function" ? next(state.datasets) : next,
    }));
  },
  appendDatasets: (datasets) => {
    if (datasets.length === 0) return;
    set((state) => {
      const existingIds = new Set(state.datasets.map((dataset) => dataset.id));
      const uniqueIncoming = datasets.filter(
        (dataset) => !existingIds.has(dataset.id)
      );
      if (uniqueIncoming.length === 0) return {};
      return { datasets: [...state.datasets, ...uniqueIncoming] };
    });
  },
  upsertDataset: (dataset) => {
    set((state) => {
      const existing = state.datasets.findIndex((d) => d.id === dataset.id);
      if (existing < 0) {
        return { datasets: [...state.datasets, dataset] };
      }
      return {
        datasets: state.datasets.map((item) =>
          item.id === dataset.id ? dataset : item
        ),
      };
    });
  },
  removeDatasetById: (id) => {
    set((state) => ({ datasets: state.datasets.filter((d) => d.id !== id) }));
  },
  toggleDatasetSelection: (id) => {
    set((state) => ({
      datasets: state.datasets.map((dataset) =>
        dataset.id === id
          ? { ...dataset, isSelected: !dataset.isSelected }
          : dataset
      ),
    }));
  },
  setSelectedDatasetIds: (datasetIds) => {
    const selectedSet = new Set(datasetIds);
    set((state) => ({
      datasets: state.datasets.map((dataset) => ({
        ...dataset,
        isSelected: selectedSet.has(dataset.id),
      })),
    }));
  },
  setIsDatasetsInitialized: (isDatasetsInitialized) => {
    set(() => ({ isDatasetsInitialized }));
  },
});
