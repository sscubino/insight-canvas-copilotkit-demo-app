import { get, set, del } from "idb-keyval";
import type { DatasetMeta } from "@/types/dataset";

const INDEX_KEY = "datasets:index";
const fileKey = (id: string) => `dataset-file:${id}`;

export const getStoredDatasets = async (): Promise<DatasetMeta[]> => {
  const index = await get<DatasetMeta[]>(INDEX_KEY);
  return index ?? [];
};

export const storeDataset = async (
  meta: DatasetMeta,
  content: string
): Promise<void> => {
  const index = await getStoredDatasets();
  const existing = index.findIndex((d) => d.id === meta.id);

  if (existing >= 0) {
    index[existing] = meta;
  } else {
    index.push(meta);
  }

  await set(INDEX_KEY, index);
  await set(fileKey(meta.id), content);
};

export const getDatasetContent = async (
  id: string
): Promise<string | null> => {
  const content = await get<string>(fileKey(id));
  return content ?? null;
};

export const removeStoredDataset = async (id: string): Promise<void> => {
  const index = await getStoredDatasets();
  const filtered = index.filter((d) => d.id !== id);
  await set(INDEX_KEY, filtered);
  await del(fileKey(id));
};
