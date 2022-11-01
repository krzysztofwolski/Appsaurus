import { gql } from "https://deno.land/x/graphql_request/mod.ts";
import { gqlFetch } from "./../../gql-fetch.ts";
import { ApiFetchConfig } from "./../types.ts";
type AppsQueryResponse = {
  apps?: {
    totalCount: number;
    edges: {
      node: {
        id: string;
        name: string;
      };
    }[];
  };
};

const query = gql`
    {
        apps(first: 20){
        totalCount
        edges{
            node{
            id
            name
            }
        }
        }
    }
  `;
export const queryInstalledApps = async ({ apiUrl, token }: ApiFetchConfig) => {
  return await gqlFetch<AppsQueryResponse>(apiUrl, token, query);
};
