"use client";

import { useReactFlow, useStore } from "@xyflow/react";
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";

const zoomSelector = (state: { transform: [number, number, number] }) =>
  Math.round(state.transform[2] * 100);

const CanvasZoomControls = () => {
  const { zoomIn, zoomOut, fitView } = useReactFlow();
  const zoomLevel = useStore(zoomSelector);

  const handleZoomIn = () => zoomIn({ duration: 200 });
  const handleZoomOut = () => zoomOut({ duration: 200 });
  const handleFitView = () => fitView({ padding: 0.1, duration: 300 });

  return (
    <ButtonGroup className="absolute right-3.5 bottom-3.5 z-10">
      <Button
        variant="secondary"
        size="sm"
        onClick={handleZoomOut}
        className="font-mono font-medium"
        aria-label="Zoom out"
      >
        -
      </Button>
      <Button
        variant="secondary"
        size="sm"
        onClick={handleFitView}
        className="font-mono font-medium"
        aria-label="Fit view"
      >
        {zoomLevel}%
      </Button>
      <Button
        variant="secondary"
        size="sm"
        onClick={handleZoomIn}
        className="font-mono font-medium"
        aria-label="Zoom in"
      >
        +
      </Button>
    </ButtonGroup>
  );
};

export { CanvasZoomControls };
