"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { StatusDot } from "@/components/ui/status-dot";
import { PlusIcon } from "@/components/icons/plus";
import { useSessionWorkflows } from "@/lib/application/session-workflows";
import { useSessionState } from "@/state/hooks/use-session-state";
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  useSidebar,
  SidebarNavSection,
  SidebarNavSectionTitle,
  SidebarNavButton,
  SidebarTitle,
} from "@/components/ui/sidebar";

const SESSION_DOT_CLASSES = [
  "bg-mint",
  "bg-yellow",
  "bg-lilac",
  "bg-orange",
  "bg-red",
  "bg-blue",
] as const;

const SessionsSidebar = () => {
  const { sessions, activeSessionId } = useSessionState();
  const { switchSession } = useSessionWorkflows();

  return (
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
          <SidebarTitle>Insight Canvas</SidebarTitle>
        </div>
      </SidebarHeader>

      <SidebarContent className="pb-3">
        <SidebarNavSection aria-label="Sessions">
          <SidebarNavSectionTitle>Sessions</SidebarNavSectionTitle>
          {sessions.length === 0 ? (
            <p className="px-3 text-xs font-medium text-dim">No sessions yet</p>
          ) : (
            sessions.map((session, index) => {
              const dotClass =
                SESSION_DOT_CLASSES[index % SESSION_DOT_CLASSES.length];
              const isActive = session.id === activeSessionId;

              return (
                <SidebarNavButton
                  key={session.id}
                  isActive={isActive}
                  aria-label={session.name}
                  onClick={() => {
                    if (activeSessionId === session.id) return;
                    void switchSession(session.id);
                  }}
                >
                  <StatusDot className={cn(dotClass, "size-2")} />
                  <span>{session.name}</span>
                </SidebarNavButton>
              );
            })
          )}
        </SidebarNavSection>
      </SidebarContent>

      <SessionsSidebarFooter />
    </Sidebar>
  );
};

const SessionsSidebarFooter = () => {
  const { collapsed } = useSidebar();
  const { startNewSession } = useSessionWorkflows();

  return (
    <SidebarFooter hideWhenCollapsed={false}>
      <Button
        variant="primary"
        size="lg"
        className="w-full truncate"
        aria-label="Create new session"
        onClick={() => {
          void startNewSession();
        }}
      >
        {!collapsed && "New session"}
        <PlusIcon width={20} height={20} aria-hidden="true" />
      </Button>
    </SidebarFooter>
  );
};

export { SessionsSidebar };
