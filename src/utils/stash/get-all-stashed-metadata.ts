import { METADATA_KEY } from "./types.ts";
import { MetadataStash } from "./types.ts";
export const getAllStashedMetadata = (): MetadataStash => {
  const stringified = localStorage.getItem(METADATA_KEY);
  if (!stringified || stringified.length < 1) {
    return {
      entries: [],
    };
  }
  try {
    const stash = JSON.parse(stringified) as MetadataStash;
    return stash;
  } catch {
    localStorage.removeItem(METADATA_KEY);
    return {
      entries: [],
    };
  }
};
