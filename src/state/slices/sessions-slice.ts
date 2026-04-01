import type { SessionListItem, SessionRecord } from "@/types/session";
import { upsertSessionInList } from "@/lib/sessions";
import type { StateCreator } from "zustand";
import type { AppStore } from "@/state/store";

export type SessionsSlice = {
  sessions: SessionListItem[];
  activeSessionId: string | null;
  hydrationRecord: SessionRecord | null;
  resetVersion: number;
  isInitialized: boolean;
  setSessions: (sessions: SessionListItem[]) => void;
  upsertSession: (record: SessionRecord) => void;
  setActiveSessionId: (sessionId: string | null) => void;
  setHydrationRecord: (record: SessionRecord | null) => void;
  consumeHydrationRecord: () => void;
  incrementResetVersion: () => void;
  setIsInitialized: (isInitialized: boolean) => void;
};

export const createSessionsSlice: StateCreator<
  AppStore,
  [],
  [],
  SessionsSlice
> = (set) => ({
  sessions: [],
  activeSessionId: null,
  hydrationRecord: null,
  resetVersion: 0,
  isInitialized: false,
  setSessions: (sessions) => {
    set(() => ({ sessions }));
  },
  upsertSession: (record) => {
    set((state) => ({
      sessions: upsertSessionInList(record, state.sessions),
    }));
  },
  setActiveSessionId: (activeSessionId) => {
    set(() => ({ activeSessionId }));
  },
  setHydrationRecord: (hydrationRecord) => {
    set(() => ({ hydrationRecord }));
  },
  consumeHydrationRecord: () => {
    set(() => ({ hydrationRecord: null }));
  },
  incrementResetVersion: () => {
    set((state) => ({ resetVersion: state.resetVersion + 1 }));
  },
  setIsInitialized: (isInitialized) => {
    set(() => ({ isInitialized }));
  },
});
