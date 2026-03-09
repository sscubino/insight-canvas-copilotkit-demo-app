"use client";

import { CopilotSidebar } from "@copilotkit/react-ui";

const Home = () => {
  return (
    <div className="flex h-screen w-screen items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        <div className="h-10 w-10 rounded-lg bg-linear-to-br from-accent to-cyan-500" />
        <h1 className="text-2xl font-extrabold tracking-tight text-text">
          Insight Canvas
        </h1>
        <p className="max-w-md text-center text-sm text-text-muted">
          Collaborative AI reasoning partner for data analysis. Open the chat to
          get started.
        </p>
      </div>

      <CopilotSidebar
        defaultOpen={false}
        labels={{
          title: "Insight Canvas",
          initial: "Hi! I'm your data analysis partner. Upload a dataset and ask me a question to get started.",
          placeholder: "Ask about your data...",
        }}
      />
    </div>
  );
};

export default Home;
