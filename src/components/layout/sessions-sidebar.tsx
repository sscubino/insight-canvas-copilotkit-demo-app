"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { StatusDot } from "@/components/ui/status-dot";
import { PlusIcon } from "@/components/icons/plus";
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
    name: "Onboarding Friction Review Onboarding Friction Review",
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
        <SidebarTitle>Insight Canvas</SidebarTitle>
      </div>
    </SidebarHeader>

    <SidebarContent className="pb-3">
      <SidebarNavSection aria-label="Sessions">
        <SidebarNavSectionTitle>Sessions</SidebarNavSectionTitle>
        {MOCK_SESSIONS.map(({ id, name, dotClass, active }) => (
          <SidebarNavButton key={id} isActive={active} aria-label={name}>
            <StatusDot className={cn(dotClass, "size-2")} />
            <span>{name}</span>
          </SidebarNavButton>
        ))}
      </SidebarNavSection>
    </SidebarContent>

    <SessionsSidebarFooter />
  </Sidebar>
);

const SessionsSidebarFooter = () => {
  const { collapsed } = useSidebar();

  return (
    <SidebarFooter hideWhenCollapsed={false}>
      <Button
        variant="primary"
        size="lg"
        className="w-full truncate"
        aria-label="Create new session"
      >
        {!collapsed && "New session"}
        <PlusIcon width={20} height={20} aria-hidden="true" />
      </Button>
    </SidebarFooter>
  );
};

export { SessionsSidebar };
