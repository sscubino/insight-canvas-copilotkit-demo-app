"use client";

import { create } from "zustand";
import {
  createDatasetsSlice,
  type DatasetsSlice,
} from "@/state/slices/datasets-slice";
import {
  createSessionsSlice,
  type SessionsSlice,
} from "@/state/slices/sessions-slice";
import {
  createWorkspaceSlice,
  type WorkspaceSlice,
} from "@/state/slices/workspace-slice";

export type AppStore = SessionsSlice & WorkspaceSlice & DatasetsSlice;

export const useAppStore = create<AppStore>()((...args) => ({
  ...createSessionsSlice(...args),
  ...createWorkspaceSlice(...args),
  ...createDatasetsSlice(...args),
}));
