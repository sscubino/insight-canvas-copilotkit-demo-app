"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useCopilotContext } from "@copilotkit/react-core";
import {
  getActiveSessionId,
  getSessionIndex,
  getSessionRecord,
  renameSession,
  setActiveSessionId as persistActiveSessionId,
  upsertSessionRecord,
} from "@/lib/session-storage";
import type {
  SessionListItem,
  SessionRecord,
  SessionSnapshotInput,
} from "@/types/session";
import { buildDefaultSessionName, upsertSessionInList } from "@/lib/sessions";

const AUTOSAVE_DEBOUNCE_MS = 700;

type PendingAutosave = {
  sessionId: string;
  snapshot: SessionSnapshotInput;
};

type SessionContextValue = {
  sessions: SessionListItem[];
  activeSessionId: string | null;
  hydrationRecord: SessionRecord | null;
  resetVersion: number;
  isInitialized: boolean;
  startNewSession: () => Promise<void>;
  createSessionFromFirstPrompt: (args: {
    firstPrompt: string;
    selectedDatasetIds: string[];
    snapshot: SessionSnapshotInput;
  }) => Promise<string>;
  saveActiveSessionSnapshot: (snapshot: SessionSnapshotInput) => void;
  flushActiveSessionSnapshot: (snapshot: SessionSnapshotInput) => Promise<void>;
  switchSession: (sessionId: string) => Promise<void>;
  setSessionName: (sessionId: string, name: string) => Promise<void>;
  setSessionMemorySummary: (
    sessionId: string,
    summary: string
  ) => Promise<void>;
  consumeHydrationRecord: () => void;
};

const SessionContext = createContext<SessionContextValue | null>(null);

const SessionProvider = ({ children }: { children: ReactNode }) => {
  const { threadId, setThreadId } = useCopilotContext();

  const [sessions, setSessions] = useState<SessionListItem[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [hydrationRecord, setHydrationRecord] = useState<SessionRecord | null>(
    null
  );
  const [resetVersion, setResetVersion] = useState(0);
  const [isInitialized, setIsInitialized] = useState(false);

  const autosaveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const latestAutosaveRef = useRef<PendingAutosave | null>(null);
  const activeSessionIdRef = useRef<string | null>(null);

  useEffect(() => {
    activeSessionIdRef.current = activeSessionId;
  }, [activeSessionId]);

  const upsertSessionInState = useCallback((record: SessionRecord) => {
    setSessions((prev) => upsertSessionInList(record, prev));
  }, []);

  const flushPendingAutosave = useCallback(async () => {
    const pendingAutosave = latestAutosaveRef.current;
    if (!pendingAutosave) return;

    const { sessionId, snapshot } = pendingAutosave;

    const record = await getSessionRecord(sessionId);
    if (!record) return;

    if (snapshot.messages.length === 0 && record.messages.length > 0) {
      return;
    }

    const updatedRecord: SessionRecord = {
      ...record,
      updatedAt: new Date().toISOString(),
      messages: snapshot.messages,
      canvas: snapshot.canvas,
      selectedDatasetIds: snapshot.selectedDatasetIds,
      selectedDatasetNames: snapshot.selectedDatasetNames,
    };
    await upsertSessionRecord(updatedRecord);
    latestAutosaveRef.current = null;
  }, []);

  useEffect(() => {
    const restoreSession = async () => {
      const [storedIndex, storedActiveSessionId] = await Promise.all([
        getSessionIndex(),
        getActiveSessionId(),
      ]);
      setSessions(storedIndex);

      if (!storedActiveSessionId) {
        setIsInitialized(true);
        return;
      }

      const record = await getSessionRecord(storedActiveSessionId);
      if (!record) {
        await persistActiveSessionId(null);
        setIsInitialized(true);
        return;
      }

      setActiveSessionId(record.id);
      setHydrationRecord(record);
      setThreadId(record.threadId);
      setIsInitialized(true);
    };

    void restoreSession();
  }, [setThreadId]);

  useEffect(() => {
    return () => {
      if (autosaveTimeoutRef.current) {
        clearTimeout(autosaveTimeoutRef.current);
      }
    };
  }, []);

  const startNewSession = useCallback(async () => {
    await flushPendingAutosave();

    if (autosaveTimeoutRef.current) {
      clearTimeout(autosaveTimeoutRef.current);
      autosaveTimeoutRef.current = null;
    }
    latestAutosaveRef.current = null;

    const nextThreadId = crypto.randomUUID();
    setThreadId(nextThreadId);
    setActiveSessionId(null);
    setHydrationRecord(null);
    setResetVersion((prev) => prev + 1);
    await persistActiveSessionId(null);
  }, [flushPendingAutosave, setThreadId]);

  const createSessionFromFirstPrompt = useCallback(
    async ({
      firstPrompt,
      selectedDatasetIds,
      snapshot,
    }: {
      firstPrompt: string;
      selectedDatasetIds: string[];
      snapshot: SessionSnapshotInput;
    }): Promise<string> => {
      if (activeSessionIdRef.current) return activeSessionIdRef.current;

      const now = new Date().toISOString();
      const sessionId = crypto.randomUUID();
      const record: SessionRecord = {
        id: sessionId,
        threadId,
        name: buildDefaultSessionName(firstPrompt),
        createdAt: now,
        updatedAt: now,
        firstPrompt,
        selectedDatasetIds,
        selectedDatasetNames: snapshot.selectedDatasetNames,
        messages: snapshot.messages,
        canvas: snapshot.canvas,
      };

      await upsertSessionRecord(record);
      await persistActiveSessionId(sessionId);

      setActiveSessionId(sessionId);
      upsertSessionInState(record);

      return sessionId;
    },
    [threadId, upsertSessionInState]
  );

  const saveActiveSessionSnapshot = useCallback(
    (snapshot: SessionSnapshotInput) => {
      const currentActiveSessionId = activeSessionId;
      if (!currentActiveSessionId) return;

      latestAutosaveRef.current = {
        sessionId: currentActiveSessionId,
        snapshot,
      };
      if (autosaveTimeoutRef.current) {
        clearTimeout(autosaveTimeoutRef.current);
      }

      autosaveTimeoutRef.current = setTimeout(() => {
        void flushPendingAutosave();
      }, AUTOSAVE_DEBOUNCE_MS);
    },
    [activeSessionId, flushPendingAutosave]
  );

  const flushActiveSessionSnapshot = useCallback(
    async (snapshot: SessionSnapshotInput) => {
      const currentActiveSessionId = activeSessionId;
      if (!currentActiveSessionId) return;

      latestAutosaveRef.current = {
        sessionId: currentActiveSessionId,
        snapshot,
      };
      if (autosaveTimeoutRef.current) {
        clearTimeout(autosaveTimeoutRef.current);
        autosaveTimeoutRef.current = null;
      }
      await flushPendingAutosave();
    },
    [activeSessionId, flushPendingAutosave]
  );

  const switchSession = useCallback(
    async (sessionId: string) => {
      await flushPendingAutosave();
      const record = await getSessionRecord(sessionId);
      if (!record) return;

      if (autosaveTimeoutRef.current) {
        clearTimeout(autosaveTimeoutRef.current);
        autosaveTimeoutRef.current = null;
      }
      latestAutosaveRef.current = null;

      setActiveSessionId(record.id);
      setHydrationRecord(record);
      setThreadId(record.threadId);
      await persistActiveSessionId(record.id);
    },
    [flushPendingAutosave, setThreadId]
  );

  const setSessionName = useCallback(
    async (sessionId: string, name: string) => {
      const trimmedName = name.trim();
      if (!trimmedName) return;

      const updated = await renameSession(sessionId, trimmedName);
      if (!updated) return;
      upsertSessionInState(updated);
      await upsertSessionRecord(updated);
    },
    [upsertSessionInState]
  );

  const setSessionMemorySummary = useCallback(
    async (sessionId: string, summary: string) => {
      const updated = await getSessionRecord(sessionId);
      if (!updated) return;
      const updatedRecord: SessionRecord = {
        ...updated,
        memorySummary: summary,
        updatedAt: new Date().toISOString(),
      };
      await upsertSessionRecord(updatedRecord);
    },
    []
  );

  const consumeHydrationRecord = useCallback(() => {
    setHydrationRecord(null);
  }, []);

  const contextValue = useMemo<SessionContextValue>(
    () => ({
      sessions,
      activeSessionId,
      hydrationRecord,
      resetVersion,
      isInitialized,
      startNewSession,
      createSessionFromFirstPrompt,
      saveActiveSessionSnapshot,
      flushActiveSessionSnapshot,
      switchSession,
      setSessionName,
      setSessionMemorySummary,
      consumeHydrationRecord,
    }),
    [
      sessions,
      activeSessionId,
      hydrationRecord,
      resetVersion,
      isInitialized,
      startNewSession,
      createSessionFromFirstPrompt,
      saveActiveSessionSnapshot,
      flushActiveSessionSnapshot,
      switchSession,
      setSessionName,
      setSessionMemorySummary,
      consumeHydrationRecord,
    ]
  );

  return (
    <SessionContext.Provider value={contextValue}>
      {children}
    </SessionContext.Provider>
  );
};

const useSession = (): SessionContextValue => {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error("useSession must be used within a <SessionProvider>");
  }
  return context;
};

export { SessionProvider, useSession };
