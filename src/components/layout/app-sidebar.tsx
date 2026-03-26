"use client";

import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarTitle,
} from "@/components/ui/sidebar";
import { SessionsNav } from "@/components/sessions/sessions-nav";
import { NewSessionButton } from "@/components/sessions/new-session-button";

const AppSidebar = () => {
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
        <SessionsNav />
      </SidebarContent>

      <SidebarFooter hideWhenCollapsed={false}>
        <NewSessionButton />
      </SidebarFooter>
    </Sidebar>
  );
};

export { AppSidebar };
