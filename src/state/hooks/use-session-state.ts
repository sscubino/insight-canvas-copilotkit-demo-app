"use client";

import { useAppStore } from "@/state/store";

export const useSessionState = () => {
  const sessions = useAppStore((state) => state.sessions);
  const activeSessionId = useAppStore((state) => state.activeSessionId);
  const hydrationRecord = useAppStore((state) => state.hydrationRecord);
  const resetVersion = useAppStore((state) => state.resetVersion);
  const isInitialized = useAppStore((state) => state.isInitialized);

  return {
    sessions,
    activeSessionId,
    hydrationRecord,
    resetVersion,
    isInitialized,
  };
};
