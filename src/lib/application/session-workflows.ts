"use client";

import { useCallback, useEffect } from "react";
import {
  getActiveSessionId,
  getSessionIndex,
  getSessionRecord,
  renameSession,
  setActiveSessionId as persistActiveSessionId,
  upsertSessionRecord,
} from "@/lib/session-storage";
import { buildDefaultSessionName } from "@/lib/sessions";
import { createAutosaveQueue } from "@/lib/application/autosave-queue";
import type { SessionRecord, SessionSnapshotInput } from "@/types/session";
import { useAppStore } from "@/state/store";

const autosaveQueue = createAutosaveQueue({
  readSession: getSessionRecord,
  writeSession: upsertSessionRecord,
});

const restoreSessionState = async (): Promise<void> => {
  const setSessions = useAppStore.getState().setSessions;
  const setActiveSessionId = useAppStore.getState().setActiveSessionId;
  const setHydrationRecord = useAppStore.getState().setHydrationRecord;
  const setIsInitialized = useAppStore.getState().setIsInitialized;

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
  setIsInitialized(true);
};

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

export const useSessionWorkflows = () => {
  const upsertSession = useAppStore((state) => state.upsertSession);
  const setActiveSessionId = useAppStore((state) => state.setActiveSessionId);
  const setHydrationRecord = useAppStore((state) => state.setHydrationRecord);
  const incrementResetVersion = useAppStore(
    (state) => state.incrementResetVersion
  );

  const startNewSession = useCallback(async () => {
    const previousActiveSessionId = useAppStore.getState().activeSessionId;
    await autosaveQueue.flushNow(previousActiveSessionId ?? undefined);
    if (previousActiveSessionId) {
      autosaveQueue.clearSession(previousActiveSessionId);
    }

    setActiveSessionId(null);
    setHydrationRecord(null);
    incrementResetVersion();
    await persistActiveSessionId(null);
  }, [setActiveSessionId, setHydrationRecord, incrementResetVersion]);

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
      const currentActiveSessionId = useAppStore.getState().activeSessionId;
      if (currentActiveSessionId) return currentActiveSessionId;

      const now = new Date().toISOString();
      const sessionId = crypto.randomUUID();
      const record: SessionRecord = {
        id: sessionId,
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
      upsertSession(record);

      return sessionId;
    },
    [setActiveSessionId, upsertSession]
  );

  const saveActiveSessionSnapshot = useCallback(
    (snapshot: SessionSnapshotInput) => {
      const currentActiveSessionId = useAppStore.getState().activeSessionId;
      if (!currentActiveSessionId) return;
      autosaveQueue.enqueue(currentActiveSessionId, snapshot);
    },
    []
  );

  const flushActiveSessionSnapshot = useCallback(
    async (snapshot: SessionSnapshotInput) => {
      const currentActiveSessionId = useAppStore.getState().activeSessionId;
      if (!currentActiveSessionId) return;
      autosaveQueue.enqueue(currentActiveSessionId, snapshot);
      await autosaveQueue.flushNow(currentActiveSessionId);
    },
    []
  );

  const switchSession = useCallback(
    async (sessionId: string) => {
      const currentActiveSessionId = useAppStore.getState().activeSessionId;
      await autosaveQueue.flushNow(currentActiveSessionId ?? undefined);
      const record = await getSessionRecord(sessionId);
      if (!record) return;

      if (currentActiveSessionId) {
        autosaveQueue.clearSession(currentActiveSessionId);
      }

      setActiveSessionId(record.id);
      setHydrationRecord(record);
      await persistActiveSessionId(record.id);
    },
    [setActiveSessionId, setHydrationRecord]
  );

  const setSessionName = useCallback(
    async (sessionId: string, name: string) => {
      const trimmedName = name.trim();
      if (!trimmedName) return;

      const updated = await renameSession(sessionId, trimmedName);
      if (!updated) return;
      upsertSession(updated);
    },
    [upsertSession]
  );

  const setSessionMemorySummary = useCallback(
    async (sessionId: string, summary: string) => {
      const existing = await getSessionRecord(sessionId);
      if (!existing) return;

      const updatedRecord: SessionRecord = {
        ...existing,
        memorySummary: summary,
        updatedAt: new Date().toISOString(),
      };
      await upsertSessionRecord(updatedRecord);
      upsertSession(updatedRecord);
    },
    [upsertSession]
  );

  const consumeHydrationRecord = useCallback(() => {
    useAppStore.getState().consumeHydrationRecord();
  }, []);

  return {
    startNewSession,
    createSessionFromFirstPrompt,
    saveActiveSessionSnapshot,
    flushActiveSessionSnapshot,
    switchSession,
    setSessionName,
    setSessionMemorySummary,
    consumeHydrationRecord,
  };
};
