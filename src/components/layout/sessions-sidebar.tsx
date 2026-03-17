"use client";

import { StatusDot } from "@/components/ui/status-dot";
import { PlusIcon } from "@/icons/plus";

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
    dotClass: "bg-mint",
    active: true,
  },
  {
    id: "session-2",
    name: "Retention Investigation",
    dotClass: "bg-yellow",
  },
  {
    id: "session-3",
    name: "Onboarding Friction Review",
    dotClass: "bg-lilac",
  },
];

const SidebarHeader = () => {
  return (
    <header className="flex items-center justify-between border-b border-border-card px-3.5 py-4">
      <div className="flex items-center gap-2">
        <span role="img" aria-label="kite" tabIndex={0} className="text-xl">
          🪁
        </span>
        <span className="text-lg font-medium text-foreground">
          Insight Canvas
        </span>
      </div>
      <button
        type="button"
        className="flex size-6 items-center justify-center rounded text-dim transition-colors hover:text-foreground"
        aria-label="Collapse sidebar"
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <path
            d="M10 12L6 8L10 4"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
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
              className={`flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 text-left text-xs transition-colors ${
                active
                  ? "border border-border-action bg-lilac-light/10 font-medium text-foreground"
                  : "text-muted hover:bg-surface-hover"
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

const SidebarFooter = ({
  children,
}: {
  children: React.ReactNode | React.ReactNode[];
}) => {
  return <div className="border-t border-border-card p-3">{children}</div>;
};

const NewSessionButton = () => {
  return (
    <button
      type="button"
      className="flex w-full items-center justify-center gap-1.5 rounded-md bg-action px-3 py-3 font-mono text-sm font-medium uppercase tracking-wider text-invert transition-opacity hover:opacity-90"
      aria-label="Create new session"
    >
      New session <PlusIcon width={20} height={20} aria-hidden="true" />
    </button>
  );
};

const SessionsSidebar = () => {
  return (
    <aside className="flex w-[260px] shrink-0 flex-col border border-border-card bg-surface-50 rounded-lg">
      <SidebarHeader />
      <SessionsNav />
      <SidebarFooter>
        <NewSessionButton />
      </SidebarFooter>
    </aside>
  );
};

export { SessionsSidebar };
