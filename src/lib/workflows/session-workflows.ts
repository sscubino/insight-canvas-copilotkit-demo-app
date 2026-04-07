"use client";

import {
  getActiveSessionId,
  getSessionIndex,
  getSessionRecord,
  renameSession,
  setActiveSessionId as persistActiveSessionId,
  upsertSessionRecord,
} from "@/lib/session-storage";
import { buildDefaultSessionName } from "@/lib/sessions";
import { createAutosaveQueue } from "@/lib/autosave-queue";
import type { SessionRecord, SessionSnapshotInput } from "@/types/session";
import { useAppStore } from "@/state/store";

const autosaveQueue = createAutosaveQueue({
  readSession: getSessionRecord,
  writeSession: upsertSessionRecord,
});

export const restoreSessionState = async (): Promise<void> => {
  const setSessions = useAppStore.getState().setSessions;
  const setActiveSessionId = useAppStore.getState().setActiveSessionId;
  const setHydrationRecord = useAppStore.getState().setHydrationRecord;

  const [storedIndex, storedActiveSessionId] = await Promise.all([
    getSessionIndex(),
    getActiveSessionId(),
  ]);
  setSessions(storedIndex);

  if (!storedActiveSessionId) {
    return;
  }

  const record = await getSessionRecord(storedActiveSessionId);
  if (!record) {
    await persistActiveSessionId(null);
    return;
  }

  setActiveSessionId(record.id);
  setHydrationRecord(record);
};

export const startNewSession = async () => {
  const {
    activeSessionId: previousActiveSessionId,
    setActiveSessionId,
    setHydrationRecord,
    incrementResetVersion,
  } = useAppStore.getState();

  await autosaveQueue.flushNow(previousActiveSessionId ?? undefined);
  if (previousActiveSessionId) {
    autosaveQueue.clearSession(previousActiveSessionId);
  }

  setActiveSessionId(null);
  setHydrationRecord(null);
  incrementResetVersion();
  await persistActiveSessionId(null);
};

export const createSessionFromFirstPrompt = async ({
  firstPrompt,
  selectedDatasetIds,
  snapshot,
}: {
  firstPrompt: string;
  selectedDatasetIds: string[];
  snapshot: SessionSnapshotInput;
}): Promise<string> => {
  const {
    activeSessionId: currentActiveSessionId,
    setActiveSessionId,
    upsertSession,
  } = useAppStore.getState();
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
};

export const saveActiveSessionSnapshot = (snapshot: SessionSnapshotInput) => {
  const currentActiveSessionId = useAppStore.getState().activeSessionId;
  if (!currentActiveSessionId) return;
  autosaveQueue.enqueue(currentActiveSessionId, snapshot);
};

export const flushActiveSessionSnapshot = async (
  snapshot: SessionSnapshotInput
) => {
  const currentActiveSessionId = useAppStore.getState().activeSessionId;
  if (!currentActiveSessionId) return;
  autosaveQueue.enqueue(currentActiveSessionId, snapshot);
  await autosaveQueue.flushNow(currentActiveSessionId);
};

export const switchSession = async (sessionId: string) => {
  const {
    activeSessionId: currentActiveSessionId,
    setActiveSessionId,
    setHydrationRecord,
  } = useAppStore.getState();

  await autosaveQueue.flushNow(currentActiveSessionId ?? undefined);
  const record = await getSessionRecord(sessionId);
  if (!record) return;

  if (currentActiveSessionId) {
    autosaveQueue.clearSession(currentActiveSessionId);
  }

  setActiveSessionId(record.id);
  setHydrationRecord(record);
  await persistActiveSessionId(record.id);
};

export const setSessionName = async (sessionId: string, name: string) => {
  const trimmedName = name.trim();
  if (!trimmedName) return;

  const updated = await renameSession(sessionId, trimmedName);
  if (!updated) return;
  useAppStore.getState().upsertSession(updated);
};

export const setSessionMemorySummary = async (
  sessionId: string,
  summary: string
) => {
  const existing = await getSessionRecord(sessionId);
  if (!existing) return;

  const updatedRecord: SessionRecord = {
    ...existing,
    memorySummary: summary,
    updatedAt: new Date().toISOString(),
  };
  await upsertSessionRecord(updatedRecord);
  useAppStore.getState().upsertSession(updatedRecord);
};

export const consumeHydrationRecord = () => {
  useAppStore.getState().consumeHydrationRecord();
};
