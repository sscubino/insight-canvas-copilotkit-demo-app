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

| Layer          | Technology                                                                                            |
| -------------- | ----------------------------------------------------------------------------------------------------- |
| Framework      | [Next.js 15](https://nextjs.org/) (App Router, Turbopack)                                             |
| AI Integration | [CopilotKit](https://github.com/CopilotKit/CopilotKit) (AG-UI protocol, shared state, frontend tools) |
| Canvas         | [React Flow](https://reactflow.dev/) (@xyflow/react)                                                  |
| Data Engine    | [DuckDB WASM](https://duckdb.org/docs/api/wasm) (in-browser analytical SQL)                           |
| LLM            | Anthropic Claude (via CopilotKit runtime)                                                             |
| Styling        | Tailwind CSS v4                                                                                       |
| Language       | TypeScript                                                                                            |

## Features

### Reasoning Artifacts on Canvas

Six node types form the building blocks of visual analysis:

- **Chart** — Data visualizations generated from SQL queries
- **Insight** — Data-driven observations with supporting evidence
- **Hypothesis** — Possible explanations, editable by user or agent
- **Experiment** — Test plans to validate hypotheses, with success metrics
- **Action Item** — Concrete operational tasks derived from the analysis
- **Question** — Open investigation points that branch the reasoning tree

### In-Browser SQL with DuckDB WASM

The entire data query layer runs client-side. DuckDB WASM loads CSV datasets into an in-browser analytical database, enabling the agent to run arbitrary SQL queries with sub-second latency — no backend API calls needed for data operations. Your data never leaves your device.

### Shared State (Bidirectional Sync)

Canvas nodes are synchronized between the AI agent and the React frontend via CopilotKit's shared state system. When the agent creates a node, it appears on the canvas. When the user edits a node, the agent sees the change and can respond — enabling true co-creation.

### Agent Chat Panel

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

## License

MIT
