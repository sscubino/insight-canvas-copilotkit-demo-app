"use client";

import { useReactFlow } from "@xyflow/react";

const CanvasZoomControls = () => {
  const { zoomIn, zoomOut, fitView } = useReactFlow();

  const handleZoomIn = () => zoomIn({ duration: 200 });
  const handleZoomOut = () => zoomOut({ duration: 200 });
  const handleFitView = () =>
    fitView({ padding: { x: 0.1, y: 0.3 }, duration: 300 });

  return (
    <div className="absolute right-3.5 bottom-3.5 z-10 flex overflow-hidden rounded-lg border border-border-bright bg-surface shadow-sm">
      <button
        type="button"
        onClick={handleZoomOut}
        className="border-r border-border px-2.5 py-1.5 font-medium font-mono text-xs text-muted transition-colors hover:bg-surface-2"
        aria-label="Zoom out"
      >
        -
      </button>
      <button
        type="button"
        onClick={handleFitView}
        className="border-r border-border px-2.5 py-1.5 font-medium font-mono text-xs text-muted transition-colors hover:bg-surface-2"
        aria-label="Fit view"
      >
        Fit
      </button>
      <button
        type="button"
        onClick={handleZoomIn}
        className="px-2.5 py-1.5 font-medium font-mono text-xs text-muted transition-colors hover:bg-surface-2"
        aria-label="Zoom in"
      >
        +
      </button>
    </div>
  );
};

export { CanvasZoomControls };
