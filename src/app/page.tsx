import { CopilotSidebar } from "@copilotkit/react-ui";
import { DuckDBStatusSection } from "@/components/duckdb/duckdb-status-section";

const Home = () => {
  return (
    <div className="flex h-screen w-screen items-center justify-center overflow-auto bg-background p-8">
      <main className="flex w-full max-w-2xl flex-col gap-6">
        <header className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-linear-to-br from-accent to-cyan-500" />
          <h1 className="text-2xl font-extrabold tracking-tight text-foreground">
            Insight Canvas
          </h1>
          <p className="text-center text-sm text-muted">
            Phase 1 — DuckDB WASM Layer Verification
          </p>
        </header>

        <DuckDBStatusSection />
      </main>

      <CopilotSidebar
        labels={{
          title: "Insight Canvas",
          initial:
            "Hi! I'm your data analysis partner. Upload a dataset and ask me a question to get started.",
          placeholder: "Ask about your data...",
        }}
      />
    </div>
  );
};

export default Home;
