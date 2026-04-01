"use client";

import { Drawer, DrawerContent } from "@/components/ui/drawer";
import { FileDropZone } from "@/components/chat/datasets/file-drop-zone";
import { DatasetCard } from "@/components/chat/datasets/dataset-card";
import { useDatasetWorkflows } from "@/lib/workflows/dataset-workflows";
import { useAppStore } from "@/state/store";

type DatasetDrawerProps = {
  isOpen: boolean;
  onClose: () => void;
};

const DatasetDrawer = ({ isOpen, onClose }: DatasetDrawerProps) => {
  const datasets = useAppStore((s) => s.datasets);
  const { addUserFile, toggleSelection, removeDataset } = useDatasetWorkflows();

  const handleFileSelect = async (file: File) => {
    try {
      await addUserFile(file);
    } catch (err) {
      console.error("Failed to add file:", err);
    }
  };

  const sampleDatasets = datasets.filter((d) => d.source === "sample");
  const userDatasets = datasets.filter((d) => d.source === "user");

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      className="max-h-[calc(100%-80px)]"
    >
      <DrawerContent>
        <div className="flex w-full flex-col items-center gap-4">
          <p className="text-center text-sm font-medium text-foreground">
            Upload a file or choose a sample dataset to get started.
          </p>

          <div className="flex w-full flex-col items-center gap-2">
            <FileDropZone onFileSelect={handleFileSelect} />
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
    </Drawer>
  );
};

export { DatasetDrawer };
