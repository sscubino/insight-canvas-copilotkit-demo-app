"use client";

import { cn } from "@/lib/utils";
import { StatusDot } from "@/components/ui/status-dot";
import { PlusIcon } from "@/icons/plus";
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";

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

const SessionsSidebar = () => (
  <Sidebar
    side="left"
    expandedWidth="w-[260px]"
    innerMinWidth="min-w-[258px]"
    aria-label="Sessions sidebar"
  >
    <SidebarHeader>
      <div className="flex items-center gap-2.5">
        <span role="img" aria-label="kite" className="text-xl leading-none">
          🪁
        </span>
        <span className="whitespace-nowrap text-lg font-medium text-foreground">
          Insight Canvas
        </span>
      </div>
    </SidebarHeader>

    <SidebarContent className="px-3 pb-3">
      <nav aria-label="Sessions">
        <h2 className="px-3 pt-5 pb-3 text-xs font-medium uppercase text-dim">
          Sessions
        </h2>
        <ul className="flex flex-col">
          {MOCK_SESSIONS.map(({ id, name, dotClass, active }) => (
            <li key={id}>
              <button
                type="button"
                className={cn(
                  "flex h-10 w-full items-center gap-3 rounded-lg px-3 text-left text-sm transition-colors",
                  active
                    ? "bg-surface font-semibold text-foreground"
                    : "font-medium text-muted hover:bg-surface-hover"
                )}
                aria-current={active ? "true" : undefined}
                aria-label={name}
                tabIndex={0}
              >
                <StatusDot className={cn(dotClass, "size-2")} />
                <span className="truncate">{name}</span>
              </button>
            </li>
          ))}
        </ul>
      </nav>
    </SidebarContent>

    <SessionsSidebarFooter />
  </Sidebar>
);

const SessionsSidebarFooter = () => {
  const { collapsed } = useSidebar();

  return (
    <SidebarFooter hideWhenCollapsed={false}>
      <button
        type="button"
        className={cn(
          "flex w-full items-center justify-center gap-2 rounded-lg bg-action text-invert p-3",
          "font-mono text-sm font-medium uppercase tracking-wider transition-opacity hover:opacity-90",
          "truncate"
        )}
        aria-label="Create new session"
        tabIndex={0}
      >
        {!collapsed && "New session"}
        <PlusIcon width={20} height={20} aria-hidden="true" />
      </button>
    </SidebarFooter>
  );
};

export { SessionsSidebar };
