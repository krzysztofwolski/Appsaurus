import {
  queryAppDetails,
  QueryAppDetailsArguments,
} from "./graphql/query-app-details.ts";

export const getAppDetails = async (
  { apiUrl, token, id }: QueryAppDetailsArguments,
) => {
  const resp = await queryAppDetails({ apiUrl, token, id });
  return resp.app;
};
