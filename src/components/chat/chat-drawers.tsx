"use client";

import { useEffect } from "react";
import { DatasetDrawer } from "@/components/chat/datasets/dataset-drawer";
import { NodeDetailDrawer } from "@/components/chat/node-detail/node-detail-drawer";
import { useAppStore } from "@/state/store";

const ChatDrawers = ({
  isDatasetDrawerOpen: isOpen,
  setIsOpen: setIsDatasetDrawerOpen,
}: {
  isDatasetDrawerOpen: boolean;
  setIsOpen: (v: boolean) => void;
}) => {
  useEffect(() => {
    const unsub = useAppStore.subscribe((state, prevState) => {
      const { selectedNodeId, datasets } = state;
      const { selectedNodeId: prevSelecetedNodeId } = prevState;
      if (selectedNodeId && selectedNodeId !== prevSelecetedNodeId) {
        setIsDatasetDrawerOpen(false);
      }
      const noSelectedDatasets = !datasets.some((d) => d.isSelected);
      if (noSelectedDatasets) {
        setIsDatasetDrawerOpen(true);
      }
    });

    return unsub;
  }, [setIsDatasetDrawerOpen]);

  return (
    <>
      <DatasetDrawer isOpen={isOpen} setIsOpen={setIsDatasetDrawerOpen} />
      <NodeDetailDrawer />
    </>
  );
};

export { ChatDrawers };
