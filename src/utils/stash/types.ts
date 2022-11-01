export type MetadataStashEntry = {
  id: string;
  appId: string;
  appName: string;
  name: string;
  privateMetadata: {
    key: string;
    value: string;
  }[];
  metadata: {
    key: string;
    value: string;
  }[];
};

export type MetadataStash = {
  entries: MetadataStashEntry[];
};

export const METADATA_KEY = "metadata";
