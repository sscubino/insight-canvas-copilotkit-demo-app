import { get, set } from "idb-keyval";
import type { SessionListItem, SessionRecord } from "@/types/session";
import { upsertSessionInList } from "./sessions";

const SESSION_INDEX_KEY = "sessions:index";
const ACTIVE_SESSION_ID_KEY = "sessions:active-id";

const sessionKey = (id: string) => `session:${id}`;

const sortByCreatedAtDesc = (
  sessions: SessionListItem[]
): SessionListItem[] => {
  return [...sessions].sort((a, b) => {
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });
};

export const getSessionIndex = async (): Promise<SessionListItem[]> => {
  const index = await get<SessionListItem[]>(SESSION_INDEX_KEY);
  return sortByCreatedAtDesc(index ?? []);
};

export const getActiveSessionId = async (): Promise<string | null> => {
  const activeSessionId = await get<string>(ACTIVE_SESSION_ID_KEY);
  return activeSessionId ?? null;
};

export const setActiveSessionId = async (
  sessionId: string | null
): Promise<void> => {
  await set(ACTIVE_SESSION_ID_KEY, sessionId);
};

export const getSessionRecord = async (
  sessionId: string
): Promise<SessionRecord | null> => {
  const record = await get<SessionRecord>(sessionKey(sessionId));
  return record ?? null;
};

export const upsertSessionRecord = async (
  record: SessionRecord
): Promise<void> => {
  const index = await getSessionIndex();
  const nextIndex = upsertSessionInList(record, index);

  await set(SESSION_INDEX_KEY, nextIndex);
  await set(sessionKey(record.id), record);
};

export const renameSession = async (
  sessionId: string,
  nextName: string
): Promise<SessionRecord | null> => {
  const existing = await getSessionRecord(sessionId);
  if (!existing) return null;

  const updatedRecord: SessionRecord = {
    ...existing,
    name: nextName,
    updatedAt: new Date().toISOString(),
  };
  await upsertSessionRecord(updatedRecord);
  return updatedRecord;
};
