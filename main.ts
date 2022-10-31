import { IUrl, urlParse } from "https://deno.land/x/url_parse@1.1.0/mod.ts";
import { Command } from "https://deno.land/x/cliffy@v0.25.4/command/mod.ts";
import {
  keypress,
  KeyPressEvent,
} from "https://deno.land/x/cliffy@v0.25.4/keypress/mod.ts";
import { colors } from "https://deno.land/x/cliffy@v0.25.4/ansi/colors.ts";
import { Table } from "https://deno.land/x/cliffy@v0.25.4/table/mod.ts";

const NAME = "Appsaurus";
const VERSION = "0.0.1";
const DESCRIPTION = "CLI, Deno, Saleor apps. Experimental stuff";

export interface Args {
  instanceUrl: string;
  manifestPath: string;
}

export interface Config {
  instanceIUrl: IUrl;
  instanceApiUrl: string;
  instanceDashboardUrl: string;
  tunnelIUrl: IUrl;
  appManifestUrl: string;
  appInstallUrl: string;
}

export async function openBrowser(url: string): Promise<void> {
  const programAliases = {
    windows: "explorer",
    darwin: "open",
    linux: "sensible-browser",
  };
  const process = Deno.run({ cmd: [programAliases[Deno.build.os], url] });
  await process.status();
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const getTunnelUrl = async () => {
  const p = Deno.run({
    cmd: ["ngrok", "api", "endpoints", "list"],
    stdout: "piped",
    stderr: "null",
  });
  const tunnelsOutput = JSON.parse(new TextDecoder().decode(await p.output()));

  if (!tunnelsOutput.endpoints || tunnelsOutput.endpoints.length < 1) {
    throw new Error("No running ngrok tunnels found");
  }

  if (tunnelsOutput.endpoints.length > 1) {
    console.warn(
      "More than one tunnel running. I'll assume last one is the right one. TODO: handle such scenario",
    );
  }

  const tunnelUrl = tunnelsOutput.endpoints[0].public_url;
  if (!tunnelUrl) {
    throw new Error(
      "Sorry bugaroo, could not get tunnel URL from ngrok API :(",
    );
  }
  return tunnelUrl as string;
};

interface CreateConfigArguments {
  appArgs: Args;
  tunnelUrl: string;
}

const createConfig = (
  { appArgs, tunnelUrl }: CreateConfigArguments,
): Config => {
  const instanceIUrl = urlParse(appArgs.instanceUrl);
  const instanceApiUrl = urlParse({
    protocol: instanceIUrl.protocol,
    hostname: instanceIUrl.hostname,
    pathname: "graphql/", // trailing slash required!
  }).toString();

  const instanceDashboardUrl = urlParse({
    protocol: instanceIUrl.protocol,
    hostname: instanceIUrl.hostname,
    pathname: "dashboard",
  }).toString();

  const tunnelIUrl = urlParse(tunnelUrl);

  const appManifestUrl = urlParse({
    protocol: tunnelIUrl.protocol,
    hostname: tunnelIUrl.hostname,
    pathname: appArgs.manifestPath,
  }).toString();

  // https://XXX.eu.saleor.cloud/dashboard/apps/install?manifestUrl=https://tunnel.ngrok/manifest
  const appInstallUrl = urlParse({
    protocol: instanceIUrl.protocol,
    hostname: instanceIUrl.hostname,
    pathname: "dashboard/apps/install",
    query: [{ key: "manifestUrl", value: appManifestUrl }],
  }).toString();

  return {
    instanceApiUrl,
    instanceDashboardUrl,
    instanceIUrl,
    tunnelIUrl,
    appManifestUrl,
    appInstallUrl,
  };
};

await new Command()
  .name(NAME)
  .version(VERSION)
  .description(DESCRIPTION)
  .command("tunnel", "Start ngrok tunnel")
  .option(
    "-i, --instance-url <instanceUrl:string>",
    "Saleor Cloud Instance URL",
  )
  .option(
    "-p, --port <appPort:number>",
    "Port your application is running on",
    {
      default: 3000,
    },
  )
  .option("-m, --manifest-path <manifestUrl:string>", "App manifest path", {
    default: "/api/manifest" as string,
  })
  .action(async (options, ...args) => {
    console.log(
      `Starting the tunnel for application running at port ${options.port}`,
    );

    const localManifestUrl =
      `http://localhost:${options.port}${options.manifestPath}`;
    console.log(
      `Test if manifest is available at ${
        colors.bold.underline(localManifestUrl)
      }...`,
    );

    const resp = await fetch(localManifestUrl);
    if (resp.status == 200) {
      console.log(colors.brightGreen("We were able to reach given endpoint."));
    } else {
      console.error(
        colors.red(
          `Got non 200 status - ${resp.status}. Please check if your dev server is up and running!`,
        ),
      );
      return;
    }

    console.log("Starting the ngrok...");
    const tunnel = Deno.run({
      cmd: ["ngrok", "http", options.port.toString()],
      stdout: "null",
    });

    let tunnelUrl = "";
    for (let i = 0; i < 50; i += 1) {
      try {
        tunnelUrl = await getTunnelUrl();
      } catch {
        // do nothing, we'll try again in a moment
      }
      if (tunnel) {
        break;
      }
      await sleep(100);
    }
    if (!tunnelUrl) {
      console.error(colors.bold.red("Could not get tunnel URL. Aborting."));
      return;
    } else {
      console.log(colors.brightGreen("Success"));
    }

    console.log();
    console.log();

    const config = createConfig({
      appArgs: {
        instanceUrl: options.instanceUrl || "",
        manifestPath: options.manifestPath,
      },
      tunnelUrl,
    });

    const table: Table = new Table(
      [
        "To instal the app, click on: ",
        colors.underline.yellow(config.appInstallUrl),
      ],
      [
        "Inspect traffic: ",
        colors.underline.yellow("http://localhost:4040/inspect/http"),
      ],
      ["Tunnel started at URL:", colors.underline.yellow(tunnelUrl)],
    );

    console.log(table.toString());

    console.log();
    console.log("Press i to install");
    console.log("Press a to open tunnel");
    console.log("Press t to inspect traffic");

    console.log("Press q to exit");
    while (true) {
      const event: KeyPressEvent = await keypress();

      if (event.key === "q") {
        console.log("Stopping the tunnel");
        break;
      } else if (event.key === "a") {
        await openBrowser(tunnelUrl);
      } else if (event.key === "t") {
        await openBrowser("http://localhost:4040/inspect/http");
      } else if (event.key === "i") {
        await openBrowser(config.appInstallUrl);
      }
    }

    tunnel.kill("SIGTERM");
    console.log();
    console.log(`Thank you for flying with ${NAME}`);
  })
  .parse(Deno.args);
