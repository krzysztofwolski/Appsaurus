import { ApiFetchConfig } from "./types.ts";
import { queryInstalledApps } from "./graphql/query-installed-apps.ts";

export const getInstalledApps = async ({ apiUrl, token }: ApiFetchConfig) => {
  const resp = await queryInstalledApps({ apiUrl, token });
  if (!resp.apps) {
    return [];
  }
  return resp.apps.edges.map((e) => e.node);
};
