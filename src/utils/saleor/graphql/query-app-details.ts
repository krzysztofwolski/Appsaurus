import { ApiFetchConfig } from "../types.ts";
import { gql } from "https://deno.land/x/graphql_request/mod.ts";
import { gqlFetch } from "../../gql-fetch.ts";

export type AppDetailsQueryResponse = {
  app?: {
    id: string;
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
};

export type AppDetailsQueryVariables = {
  id: string;
};
export type QueryAppDetailsArguments =
  & ApiFetchConfig
  & AppDetailsQueryVariables;

const query = gql`
query AppDetails($id: ID!) {
  app(id: $id) {
    id
    name
    privateMetadata {
      key
      value
    }
    metadata {
      key
      value
    }
  }
}
    `;

export const queryAppDetails = async (
  { apiUrl, token, id }: QueryAppDetailsArguments,
) => {
  return await gqlFetch<AppDetailsQueryResponse, AppDetailsQueryVariables>(
    apiUrl,
    token,
    query,
    { id },
  );
};
