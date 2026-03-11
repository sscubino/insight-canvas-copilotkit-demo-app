"use client";

import { StatusDot } from "@/components/ui/status-dot";

type SessionItem = {
  id: string;
  name: string;
  dotClass: string;
  active?: boolean;
};

const MOCK_SESSIONS: SessionItem[] = [
  {
    id: "session-1",
    name: "Churn Analysis Q4",
    dotClass: "bg-insight",
    active: true,
  },
  {
    id: "session-2",
    name: "Retention Deep Dive",
    dotClass: "bg-hypothesis",
  },
  {
    id: "session-3",
    name: "Segmentation v2",
    dotClass: "bg-action",
  },
];

const SidebarHeader = () => {
  return (
    <header className="flex items-center gap-2 border-b border-border px-3.5 py-4">
      <div
        className="size-6 shrink-0 rounded-md bg-linear-to-br from-accent to-cyan-500"
        aria-hidden="true"
      />
      <span className="text-lg font-bold text-foreground">
        Insight Canvas
      </span>
    </header>
  );
};

const SessionsNav = () => {
  return (
    <nav className="flex flex-1 flex-col" aria-label="Sessions">
      <h2 className="px-3.5 pt-3.5 pb-1 font-mono text-xs uppercase tracking-widest text-dim">
        Sessions
      </h2>

      <ul className="flex flex-col gap-0.5 px-2">
        {MOCK_SESSIONS.map(({ id, name, dotClass, active }) => (
          <li key={id}>
            <button
              type="button"
              className={`flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 text-left text-xs transition-colors ${active
                ? "border border-accent-border bg-accent-light font-medium text-accent"
                : "text-muted hover:bg-surface-3"
                }`}
              aria-current={active ? "true" : undefined}
            >
              <StatusDot className={dotClass} />
              {name}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
};

const SidebarFooter = ({ children }: { children: React.ReactNode | React.ReactNode[] }) => {
  return (
    <div className="border-t border-border p-3">
      {children}
    </div>
  );
};

const NewSessionButton = () => {
  return (
    <button
      type="button"
      className="flex w-full items-center justify-center gap-1.5 rounded-md bg-foreground px-3 py-1.5 text-xs font-semibold text-white transition-opacity hover:opacity-90"
    >
      + New session
    </button>
  );
};

const SessionsSidebar = () => {
  return (
    <aside className="flex w-[210px] shrink-0 flex-col border-r border-border bg-surface-2">
      <SidebarHeader />
      <SessionsNav />
      <SidebarFooter>
        <NewSessionButton />
      </SidebarFooter>
    </aside>
  );
};

export { SessionsSidebar };
