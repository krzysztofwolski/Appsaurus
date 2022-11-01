import { METADATA_KEY } from "./types.ts";

export const clearStashedMetadata = () => {
  const stringified = JSON.stringify({ entries: [] });
  localStorage.setItem(METADATA_KEY, stringified);
};
