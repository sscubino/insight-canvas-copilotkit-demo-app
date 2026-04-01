"use client";

import { useAppStore } from "@/state/store";
import { useEffect } from "react";
import { restoreSessionState } from "@/lib/workflows/session-workflows";

export const useSessionBootstrap = () => {
  const isInitialized = useAppStore((state) => state.isInitialized);
  const setIsInitialized = useAppStore((state) => state.setIsInitialized);

  useEffect(() => {
    if (isInitialized) return;

    void restoreSessionState().catch(() => {
      setIsInitialized(true);
    });
  }, [isInitialized, setIsInitialized]);
};
