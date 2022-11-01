import { ApiFetchConfig } from "../types.ts";
import { gqlFetch } from "../../gql-fetch.ts";
import { gql } from "https://deno.land/x/graphql_request/mod.ts";
type AppDeleteMutationResponse = {
  errors?: {
    message: string;
  }[];
};

type AppDeleteMutationVariables = {
  id: string;
};

type MutateAppDeleteArguments = ApiFetchConfig & {
  id: string;
};

const query = gql`
    mutation AppDelete($id: ID!){
      appDelete(id: $id){
        errors{
          message
        }    
      }
    }
  `;

export const mutateAppDelete = async (
  { id, apiUrl, token }: MutateAppDeleteArguments,
) => {
  const resp = await gqlFetch<
    AppDeleteMutationResponse,
    AppDeleteMutationVariables
  >(apiUrl, token, query, { id });
  return resp.errors;
};
