"use client";

import { Button } from "@/components/ui/button";
import { PlusIcon } from "@/components/icons/plus";
import { useSessionWorkflows } from "@/lib/workflows/session-workflows";
import { useSidebar } from "@/components/ui/sidebar";

const NewSessionButton = () => {
  const { collapsed } = useSidebar();
  const { startNewSession } = useSessionWorkflows();

  return (
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
  );
};

export { NewSessionButton };
