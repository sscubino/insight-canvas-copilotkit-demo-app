import type { SessionRecord, SessionSnapshotInput } from "@/types/session";

type AutosaveQueueDeps = {
  readSession: (sessionId: string) => Promise<SessionRecord | null>;
  writeSession: (record: SessionRecord) => Promise<void>;
  debounceMs?: number;
};

export type AutosaveQueue = {
  enqueue: (sessionId: string, snapshot: SessionSnapshotInput) => void;
  flushNow: (sessionId?: string) => Promise<void>;
  clearSession: (sessionId: string) => void;
  clearAll: () => void;
};

const DEFAULT_AUTOSAVE_DEBOUNCE_MS = 750;

export const createAutosaveQueue = ({
  readSession,
  writeSession,
  debounceMs = DEFAULT_AUTOSAVE_DEBOUNCE_MS,
}: AutosaveQueueDeps): AutosaveQueue => {
  const pendingBySession = new Map<string, SessionSnapshotInput>();
  let debounceTimer: ReturnType<typeof setTimeout> | null = null;
  let inFlight = false;
  let rerunAfterFlight = false;
  let activeDrain: Promise<void> | null = null;

  const mergeAndWrite = async (
    sessionId: string,
    snapshot: SessionSnapshotInput
  ): Promise<void> => {
    const record = await readSession(sessionId);
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
    await writeSession(updatedRecord);
  };

  const runDrain = async (): Promise<void> => {
    if (inFlight) {
      rerunAfterFlight = true;
      return activeDrain ?? Promise.resolve();
    }

    inFlight = true;
    activeDrain = (async () => {
      do {
        rerunAfterFlight = false;

        while (pendingBySession.size > 0) {
          const pendingEntries = Array.from(pendingBySession.entries());
          pendingBySession.clear();

          for (const [sessionId, snapshot] of pendingEntries) {
            await mergeAndWrite(sessionId, snapshot);
          }
        }
      } while (rerunAfterFlight || pendingBySession.size > 0);
    })().finally(() => {
      inFlight = false;
      activeDrain = null;
    });

    return activeDrain;
  };

  const scheduleDrain = () => {
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }
    debounceTimer = setTimeout(() => {
      debounceTimer = null;
      void runDrain();
    }, debounceMs);
  };

  return {
    enqueue: (sessionId, snapshot) => {
      pendingBySession.set(sessionId, snapshot);
      scheduleDrain();
    },
    flushNow: async (sessionId) => {
      if (debounceTimer) {
        clearTimeout(debounceTimer);
        debounceTimer = null;
      }

      if (sessionId && !pendingBySession.has(sessionId)) {
        await activeDrain;
        return;
      }

      await runDrain();
    },
    clearSession: (sessionId) => {
      pendingBySession.delete(sessionId);
    },
    clearAll: () => {
      pendingBySession.clear();
      if (debounceTimer) {
        clearTimeout(debounceTimer);
        debounceTimer = null;
      }
    },
  };
};
