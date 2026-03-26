"use client";

import { cn } from "@/lib/utils";
import { StatusDot } from "@/components/ui/status-dot";
import { useSessionWorkflows } from "@/lib/workflows/session-workflows";
import { useSessionState } from "@/state/hooks/use-session-state";
import {
  SidebarNavSection,
  SidebarNavSectionTitle,
  SidebarNavButton,
} from "@/components/ui/sidebar";

const SESSION_DOT_CLASSES = [
  "bg-mint",
  "bg-yellow",
  "bg-lilac",
  "bg-orange",
  "bg-red",
  "bg-blue",
] as const;

const SessionsNav = () => {
  const { sessions, activeSessionId, isInitialized } = useSessionState();
  const { switchSession } = useSessionWorkflows();

  return (
    <SidebarNavSection
      aria-label="Sessions"
      className={cn(
        "transition-opacity duration-300",
        isInitialized ? "opacity-100" : "opacity-0 pointer-events-none"
      )}
    >
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
  );
};

export { SessionsNav };
