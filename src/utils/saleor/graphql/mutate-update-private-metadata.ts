type UpdatePrivateMetadataMutationResponse = {
  errors?: {
    message: string;
  }[];
};

type UpdatePrivateMetadataMutationInput = {
  key: string;
  value: string;
}[];

export const mutateUpdatePrivateMetadata = async (
  id: string,
  input: UpdatePrivateMetadataMutationInput,
) => {
  // TODO: update definition
  const query = `
mutation UpdatePrivateMetadata($id: ID!, $input: [MetadataInput!]!){
  updatePrivateMetadata(id: $id, input: $input){
    errors{
      message
    }
  }
}
    `;
  const resp = await fetch("X", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      query,
      variables: {
        id,
        input,
      },
    }),
  });
  const body = await resp.json() as UpdatePrivateMetadataMutationResponse;
  return body.errors;
};
