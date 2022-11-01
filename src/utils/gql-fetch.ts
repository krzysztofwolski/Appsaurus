import { GraphQLClient } from "https://deno.land/x/graphql_request/mod.ts";

export const gqlFetch = async <TResponse, TVariables = null>(
  apiUrl: string,
  token: string,
  query: string,
  variables?: TVariables,
) => {
  const graphQLClient = new GraphQLClient(apiUrl, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  return await graphQLClient.request<TResponse, TVariables>(query, variables);
};
