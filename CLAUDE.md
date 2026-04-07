# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Insight Canvas is a CopilotKit-powered collaborative reasoning canvas for data analysis. An AI agent and user interact through a shared canvas of nodes (insights, charts, hypotheses, experiments, action items, questions) backed by in-browser DuckDB WASM for SQL queries.

## Commands

```bash
pnpm dev          # Start dev server (Next.js + Turbopack)
pnpm build        # Production build
pnpm lint         # ESLint
pnpm format       # Prettier (write)
pnpm format:check # Prettier (check only)
```

No test framework is configured.

## Environment Variables

Copy `.env.example` to `.env.local`. Required: `ANTHROPIC_API_KEY`. Optional model overrides: `ANTHROPIC_FAST_MODEL`, `COPILOTKIT_BUILT_IN_AGENT_MODEL`.

## Architecture

### Bidirectional Agent-UI Sync

The core pattern is **bidirectional state sync** between the CopilotKit agent and the React UI:

- **User → Agent**: User edits canvas nodes → Zustand store updates → pushed to agent shared state → agent re-reasons
- **Agent → UI**: Agent modifies shared state → pulled into Zustand → React Flow renders changes
- **Sync orchestration**: `useCanvasAgentSharedState` hook uses fingerprinting to avoid ping-pong loops, with debounced position updates (700ms) and a hydration gate for initial load

### State Management

**Zustand store** (`src/state/store.ts`) composed of three slices:
- `WorkspaceSlice` — canvas nodes/edges (React Flow), selected node
- `SessionsSlice` — session metadata, messages, persistence
- `DatasetsSlice` — loaded datasets, selected dataset IDs

**Agent shared state** (CopilotKit) mirrors the workspace slice. The bridge layer (`src/lib/canvas-agent-bridge.ts`, `src/lib/agent-canvas-state.ts`) handles merge logic and structural vs. positional fingerprinting.

### Frontend Tools (Agent-Callable)

Registered via `useFrontendTool` in hooks — these run **client-side in the browser**:
- `run_sql_query` — executes SQL against DuckDB WASM, returns columns/rows
- `generate_chart` — creates a chart node on canvas with a Vega-Lite spec

The agent does **not** create chart nodes via shared state; it must use the `generate_chart` tool.

### DuckDB WASM

All data processing is client-side. `DuckDBProvider` (`src/contexts/duckdb-context.tsx`) initializes the WASM module in a web worker. The `useDuckDB()` hook exposes `runQuery`, `loadCSV`, `loadJSON`, and status.

### Canvas Node Types

Six node variants defined in `src/types/canvas.ts`: `chart`, `insight`, `hypothesis`, `experiment`, `action_item`, `question`. Each has a corresponding React component in `src/components/canvas/nodes/`. All share `base-node.tsx`. Node type config (colors, icons) lives in `src/constants/nodes-config.ts`.

### Session Persistence

Sessions are stored in **IndexedDB** (via `idb-keyval`). Workflows in `src/lib/workflows/` handle debounced saves. Session records include canvas state, messages, dataset info, and memory summaries.

### Key Hook Responsibilities

- `useCanvasAgentSharedState` — bidirectional Zustand ↔ agent state sync
- `useCopilotDataTools` — registers SQL/chart frontend tools + injects schema context
- `useCopilotStateRenderTools` — agent-side tools for canvas modification
- `useCopilotSessionMemory` — session persistence coordination
- `useChatSessionSync` — message history + session linking
- `useAutoFitNewNodes` — auto-layout when nodes are added

### Agent System Prompt

Located in `src/constants/system-prompt.ts`. Defines the agent's role as a data analyst, canvas node usage rules, DuckDB SQL syntax guidance, and shared state editing constraints.

## Tech Stack

- **Next.js 15** (App Router, Turbopack) with **React 19**
- **CopilotKit** for agent orchestration and AG-UI protocol
- **@xyflow/react** (React Flow) for the interactive canvas
- **DuckDB WASM** for in-browser SQL
- **Vega-Lite** for chart rendering (`src/components/charts/vega-chart.tsx`)
- **Zustand** for client state, **Zod** for validation
- **Tailwind CSS v4** with CSS variable theming
- **pnpm** package manager

## Code Conventions

- Path alias: `@/*` maps to `src/*`
- Prettier: double quotes, 2-space indent, 80-char line width
- CopilotKit packages must be listed in `next.config.ts` `transpilePackages`
