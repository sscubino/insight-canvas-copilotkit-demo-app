import type { SessionCanvasState } from "@/types/session";

export type CanvasAgentBridgeApi = {
  syncCanvasToAgent: (canvas: SessionCanvasState) => void;
};

let bridge: CanvasAgentBridgeApi | null = null;

/**
 * Registers the active agent sync implementation (from the canvas sync hook).
 * Unregister on cleanup to avoid calling a stale agent reference.
 */
export const registerCanvasAgentBridge = (api: CanvasAgentBridgeApi) => {
  bridge = api;
  return () => {
    bridge = null;
  };
};

export const getCanvasAgentBridge = (): CanvasAgentBridgeApi | null => bridge;

let hydrationBlocksAgentToZustand = false;

/**
 * While true, the canvas sync hook must not apply agent.state → Zustand
 * and should avoid Zustand → agent except via explicit `syncCanvasToAgent`.
 */
export const canvasHydrationGate = {
  setBlocked: (blocked: boolean) => {
    hydrationBlocksAgentToZustand = blocked;
  },
  isBlocked: () => hydrationBlocksAgentToZustand,
};
