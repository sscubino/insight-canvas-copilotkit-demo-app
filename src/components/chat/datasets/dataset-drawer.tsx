"use client";

import { Drawer, DrawerContent, DrawerFooter } from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { FileDropZone } from "@/components/chat/datasets/file-drop-zone";
import { DatasetCard } from "@/components/chat/datasets/dataset-card";
import { useDatasetWorkflows } from "@/lib/workflows/dataset-workflows";
import { useAppStore } from "@/state/store";
import { useEffect, useRef } from "react";
import { useAgent, useCopilotKit } from "@copilotkit/react-core/v2";
import { buildDatasetSelectionPayload } from "@/components/chat/user-message";
import { DATASET_SELECTION_PREFIX } from "@/constants/chat";

type DatasetDrawerProps = {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
};

const DatasetDrawer = ({ isOpen, setIsOpen }: DatasetDrawerProps) => {
  const { agent } = useAgent();
  const { copilotkit } = useCopilotKit();
  const datasets = useAppStore((s) => s.datasets);
  const { addUserFile, toggleSelection, removeDataset } = useDatasetWorkflows();

  const snapshotSelectedDatasetIdsRef = useRef<Set<string>>(new Set());

  const sampleDatasets = datasets.filter((d) => d.source === "sample");
  const userDatasets = datasets.filter((d) => d.source === "user");
  const selectedDatasets = datasets.filter((d) => d.isSelected);
  const hasSelectedDatasets = selectedDatasets.length > 0;
  const areAllSelectedDatasetsLoaded = datasets.every(
    (d) => !d.isSelected || d.isLoaded
  );

  useEffect(() => {
    if (!isOpen) return;
    snapshotSelectedDatasetIdsRef.current = new Set(
      useAppStore
        .getState()
        .datasets.filter((d) => d.isSelected)
        .map((d) => d.id)
    );
  }, [isOpen]);

  const handleNewFile = async (file: File) => {
    try {
      await addUserFile(file);
    } catch (err) {
      console.error("Failed to add file:", err);
    }
  };

  const handleConfirm = () => {
    if (!hasSelectedDatasets) return;

    const initialSelectedDatasetsIds = snapshotSelectedDatasetIdsRef.current;
    const currentSelectedDatasetsIds = new Set(
      selectedDatasets.map((d) => d.id)
    );

    const selectionChanged =
      !currentSelectedDatasetsIds.isSupersetOf(initialSelectedDatasetsIds) ||
      !initialSelectedDatasetsIds.isSupersetOf(currentSelectedDatasetsIds);

    if (selectionChanged) {
      void agent.addMessage({
        role: "user",
        id: `${DATASET_SELECTION_PREFIX}${crypto.randomUUID()}`,
        content: buildDatasetSelectionPayload(selectedDatasets),
      });
      void copilotkit.runAgent({ agent });
    }

    setIsOpen(false);
  };

  return (
    <Drawer isOpen={isOpen} className="max-h-[calc(100%-80px)]">
      <DrawerContent>
        <div className="flex w-full flex-col items-center gap-4">
          <p className="text-center text-sm font-medium text-foreground">
            Upload a file or choose a sample dataset to get started.
          </p>

          <div className="flex w-full flex-col items-center gap-2">
            <FileDropZone onFileSelect={handleNewFile} />
            <p className="text-center font-sans text-xs font-medium text-dim">
              Supported formats: CSV, JSON
            </p>
          </div>
        </div>

        <div className="flex w-full flex-col gap-4">
          {userDatasets.length > 0 && (
            <div className="flex w-full flex-col gap-2">
              <p className="font-sans text-xs font-medium text-dim">
                YOUR DATASETS
              </p>
              <div
                className="flex flex-col gap-2"
                role="listbox"
                aria-label="User datasets"
              >
                {userDatasets.map((dataset) => (
                  <DatasetCard
                    key={dataset.id}
                    dataset={dataset}
                    onToggle={toggleSelection}
                    onDelete={(id) => {
                      void removeDataset(id);
                    }}
                  />
                ))}
              </div>
            </div>
          )}

          <div className="flex w-full flex-col gap-2">
            <p className="font-sans text-xs font-medium text-dim">
              SAMPLE DATASETS
            </p>
            <div
              className="flex flex-col gap-2"
              role="listbox"
              aria-label="Sample datasets"
            >
              {sampleDatasets.map((dataset) => (
                <DatasetCard
                  key={dataset.id}
                  dataset={dataset}
                  onToggle={toggleSelection}
                />
              ))}
            </div>
          </div>
        </div>
      </DrawerContent>

      <DrawerFooter>
        <Button
          variant="primary"
          size="md"
          className="w-full duration-500"
          disabled={!hasSelectedDatasets || !areAllSelectedDatasetsLoaded}
          onClick={handleConfirm}
          aria-label="Confirm dataset selection"
        >
          Confirm Selection
        </Button>
      </DrawerFooter>
    </Drawer>
  );
};

export { DatasetDrawer };
