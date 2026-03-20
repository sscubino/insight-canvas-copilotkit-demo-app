"use client";

import { useReactFlow, useStore } from "@xyflow/react";

const zoomSelector = (state: { transform: [number, number, number] }) =>
  Math.round(state.transform[2] * 100);

const CanvasZoomControls = () => {
  const { zoomIn, zoomOut, fitView } = useReactFlow();
  const zoomLevel = useStore(zoomSelector);

  const handleZoomIn = () => zoomIn({ duration: 200 });
  const handleZoomOut = () => zoomOut({ duration: 200 });
  const handleFitView = () =>
    fitView({ padding: { x: 0.1, y: 0.3 }, duration: 300 });

  return (
    <div className="absolute right-3.5 bottom-3.5 z-10 flex overflow-hidden rounded-lg border border-border bg-surface shadow-sm">
      <button
        type="button"
        onClick={handleZoomOut}
        className="border-r border-border px-2.5 py-1.5 font-mono text-xs font-medium text-muted transition-colors hover:bg-surface-hover"
        aria-label="Zoom out"
      >
        -
      </button>
      <button
        type="button"
        onClick={handleFitView}
        className="border-r border-border px-2.5 py-1.5 font-mono text-xs font-medium text-muted transition-colors hover:bg-surface-hover"
        aria-label="Fit view"
      >
        {zoomLevel}%
      </button>
      <button
        type="button"
        onClick={handleZoomIn}
        className="px-2.5 py-1.5 font-mono text-xs font-medium text-muted transition-colors hover:bg-surface-hover"
        aria-label="Zoom in"
      >
        +
      </button>
    </div>
  );
};

export { CanvasZoomControls };
