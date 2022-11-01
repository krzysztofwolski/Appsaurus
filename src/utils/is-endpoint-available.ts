/**
 * @param endpointUrl url of the endpoint which needs to be tested
 * @returns true if endpoint response code is equal 200
 */
export const isEndpointAvailable = async (
  endpointUrl: string,
): Promise<boolean> => {
  try {
    const resp = await fetch(endpointUrl);
    if (resp.status == 200) {
      return true;
    } else {
      return false;
    }
  } catch {
    return false;
  }
};
