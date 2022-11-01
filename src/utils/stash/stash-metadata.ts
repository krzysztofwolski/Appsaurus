import { METADATA_KEY } from "./types.ts";
import { MetadataStashEntry } from "./types.ts";
import { getAllStashedMetadata } from "./get-all-stashed-metadata.ts";

export const stashMetadata = (entry: MetadataStashEntry) => {
  const existingStash = getAllStashedMetadata();
  existingStash.entries = [entry, ...existingStash.entries];

  const stringified = JSON.stringify(existingStash);
  localStorage.setItem(METADATA_KEY, stringified);
};
