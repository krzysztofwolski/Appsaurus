import { sleep } from "@utils/sleep.ts";
import { getAvailableTunnels } from "@utils/ngrok/get-available-tunnels.ts";

/**
 * Periodically checks or
 * @param timeout time in ms
 * @returns
 */
export const waitAndGetTunnelUrl = async (timeout: number) => {
  const poolingTime = 100;
  for (let i = 0; i < timeout; i += poolingTime) {
    const tunnelUrls = await getAvailableTunnels();
    if (tunnelUrls.length < 1) {
      // ngrok had not enough time to start up.
      // wait a little more
      await sleep(poolingTime);
    } else {
      return tunnelUrls[0];
    }
  }
};
