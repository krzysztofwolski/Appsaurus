import { urlParse } from "url_parse";

interface CreateIUrlsArguments {
  tunnelUrl: string;
  instanceUrl: string;
  manifestPath: string;
}

export const createIUrls = (
  { tunnelUrl, instanceUrl, manifestPath }: CreateIUrlsArguments,
) => {
  const instanceIUrl = urlParse(instanceUrl);
  const saleorApiUrl = urlParse({
    protocol: instanceIUrl.protocol,
    hostname: instanceIUrl.hostname,
    pathname: "graphql/", // trailing slash required!
  });

  const saleorDashboardUrl = urlParse({
    protocol: instanceIUrl.protocol,
    hostname: instanceIUrl.hostname,
    pathname: "dashboard",
  });

  const tunnelIUrl = urlParse(tunnelUrl);

  const tunneledManifestIUrl = urlParse({
    protocol: tunnelIUrl.protocol,
    hostname: tunnelIUrl.hostname,
    pathname: manifestPath,
  });

  // https://XXX.eu.saleor.cloud/dashboard/apps/install?manifestUrl=https://tunnel.ngrok/manifest
  const tunneledInstallIUrl = urlParse({
    protocol: instanceIUrl.protocol,
    hostname: instanceIUrl.hostname,
    pathname: "dashboard/apps/install",
    query: [{ key: "manifestUrl", value: tunneledManifestIUrl.toString() }],
  });

  return {
    saleorApiUrl,
    saleorDashboardUrl,
    instanceIUrl,
    tunnelIUrl,
    tunneledManifestIUrl,
    tunneledInstallIUrl,
  };
};
