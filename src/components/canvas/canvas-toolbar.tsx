"use client";

import { useState } from "react";

type ToolMode = "select" | "move" | "connect";

const TOOL_OPTIONS: { id: ToolMode; label: string }[] = [
  { id: "select", label: "Select" },
  { id: "move", label: "Move" },
  { id: "connect", label: "Connect" },
];

const CanvasToolbar = () => {
  const [activeTool, setActiveTool] = useState<ToolMode>("select");

  return (
    <nav
      className="absolute top-3.5 left-1/2 z-10 flex -translate-x-1/2 gap-0.5 rounded-lg border border-border-bright bg-surface p-1 shadow-sm"
      aria-label="Canvas tools"
    >
      {TOOL_OPTIONS.map(({ id, label }) => (
        <button
          key={id}
          type="button"
          onClick={() => setActiveTool(id)}
          className={`rounded-sm px-2.5 py-1.5 text-xs font-medium transition-colors ${activeTool === id
            ? "border border-border bg-surface-2 text-foreground"
            : "text-muted hover:text-foreground border border-transparent"
            }`}
          aria-pressed={activeTool === id}
        >
          {label}
        </button>
      ))}

      <div className="mx-0.5 w-px self-stretch bg-border" role="separator" />

      <button
        type="button"
        className="rounded-md px-2.5 py-1.5 text-xs font-semibold text-accent transition-colors hover:bg-accent-light"
        aria-label="Open reasoning trace"
      >
        Reasoning trace
      </button>
    </nav>
  );
};

export { CanvasToolbar };
