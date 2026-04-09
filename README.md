# Insight Canvas

**AI-powered collaborative reasoning for data analysis** — a demo app built with [CopilotKit](https://github.com/CopilotKit/CopilotKit) and [React Flow](https://reactflow.dev/).

Insight Canvas demonstrates how AI agents can go beyond chat to become **collaborative reasoning partners**. Instead of just answering questions, the agent produces structured visual artifacts — insights, charts, hypotheses, experiments, and action items — arranged on an interactive canvas where humans and AI co-create the analysis.

## The Concept

Traditional AI chat interfaces produce linear text. Insight Canvas takes a different approach:

1. **You ask a question** about your dataset (e.g., "Identify churn risk patterns")
2. **The agent reasons visually** — producing a chain of connected nodes on the canvas
3. **You edit and refine** — modify a hypothesis, and the agent detects the change and responds
4. **The reasoning chain grows** — Chart → Insight → Hypothesis → Experiment → Action Item

This creates a **bidirectional collaboration loop** where the human steers the direction and the agent does the heavy analytical lifting.

## Tech Stack

| Layer          | Technology                                                                                                 |
| -------------- | ---------------------------------------------------------------------------------------------------------- |
| Framework      | [Next.js 15](https://nextjs.org/) (App Router, Turbopack) + React 19                                       |
| AI Integration | [CopilotKit 1.54](https://github.com/CopilotKit/CopilotKit) (AG-UI protocol, shared state, frontend tools) |
| Canvas         | [React Flow 12](https://reactflow.dev/) (@xyflow/react)                                                    |
| Data Engine    | [DuckDB WASM 1.29](https://duckdb.org/docs/api/wasm) (in-browser analytical SQL)                           |
| Charts         | [Vega-Lite 6](https://vega.github.io/vega-lite/) via vega-embed                                            |
| LLM            | Anthropic Claude (Sonnet 4.6 for analysis, Haiku 4.5 for session ops)                                      |
| State          | [Zustand 5](https://zustand.docs.pmnd.rs/) + IndexedDB (session persistence via idb-keyval)                |
| Styling        | Tailwind CSS v4                                                                                            |
| Language       | TypeScript                                                                                                 |

## Features

### Reasoning Artifacts on Canvas

Six node types form the building blocks of visual analysis:

- **Chart** — Vega-Lite visualizations generated from SQL queries (created by the agent via the `generate_chart` tool)
- **Insight** — Data-driven observations with supporting evidence and specific numbers
- **Hypothesis** — Possible explanations, editable by user or agent
- **Experiment** — Test plans to validate hypotheses, with expected outcomes
- **Action Item** — Concrete operational tasks derived from the analysis
- **Question** — Open investigation points that branch the reasoning tree

### In-Browser SQL with DuckDB WASM

The entire data query layer runs client-side. DuckDB WASM runs in a web worker and loads CSV datasets into an in-browser analytical database, enabling the agent to run arbitrary SQL queries with sub-second latency — no backend API calls needed for data operations. Your data never leaves your device.

### Bidirectional Agent-UI Sync

Canvas nodes are synchronized between the AI agent and the React frontend via CopilotKit's shared state system:

- **User → Agent**: Edits to canvas nodes flow through Zustand → agent shared state → agent re-reasons
- **Agent → UI**: Agent state changes pull into Zustand → React Flow renders updates

The sync layer uses structural and positional fingerprinting to avoid ping-pong loops, with debounced position updates (700ms) and a hydration gate on initial load.

### Agent-Callable Frontend Tools

Two tools run **client-side in the browser**, callable by the agent:

- `run_sql_query` — executes SQL against DuckDB WASM, returns columns/rows
- `generate_chart` — creates a Chart node on the canvas from a Vega-Lite spec

### Session Persistence

Sessions are stored in IndexedDB and survive page reloads. Each session record includes canvas state, message history, dataset metadata, and AI-generated memory summaries for context continuity.

### Sample Datasets

Three built-in CSV datasets to explore immediately:

| Dataset               | Rows | Use case                        |
| --------------------- | ---- | ------------------------------- |
| `saas-churn.csv`      | 300  | Customer churn risk analysis    |
| `retail_complete.csv` | 250  | Retail sales & inventory        |
| `pipeline_q4.csv`     | 200  | Sales pipeline / Q4 forecasting |

You can also upload your own CSV or JSON datasets.

### Insight Copilot Chat Panel

A side panel provides a conversational interface where the agent explains its reasoning, reports what actions it took on the canvas, and accepts follow-up prompts.

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) 18+
- [pnpm](https://pnpm.io/) package manager
- An [Anthropic API key](https://console.anthropic.com/)

### Setup

```bash
# Clone the repository
git clone https://github.com/your-username/insight-canvas-copilotkit-demo-app.git
cd insight-canvas-copilotkit-demo-app

# Install dependencies
pnpm install

# Set up environment variables
cp .env.example .env.local
```

Add your Anthropic API key to `.env.local`:

```
ANTHROPIC_API_KEY=your_anthropic_api_key_here
```

Optional model overrides:

```
ANTHROPIC_FAST_MODEL=claude-haiku-4-5          # Used for session titles & memory summaries
COPILOTKIT_BUILT_IN_AGENT_MODEL=anthropic/claude-sonnet-4-6  # Main analysis agent
```

### Development

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build

```bash
pnpm build
pnpm start
```

### Other Commands

```bash
pnpm lint          # ESLint
pnpm format        # Prettier (write)
pnpm format:check  # Prettier (check only)
```

## License

MIT
