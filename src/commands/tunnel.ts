import { colors } from "cliffy/ansi/colors.ts";
import { openBrowser } from "@utils/open-browser.ts";
import { Table } from "cliffy/table/mod.ts";
import { keypress, KeyPressEvent } from "cliffy/keypress/mod.ts";
import { Command } from "cliffy/command/mod.ts";
import { NAME } from "../const.ts";
import { isEndpointAvailable } from "@utils/is-endpoint-available.ts";
import { getAvailableTunnels } from "@utils/ngrok/get-available-tunnels.ts";
import { createTunnel } from "@utils/ngrok/create-tunnel.ts";
import { waitAndGetTunnelUrl } from "@utils/ngrok/wait-and-get-tunnel-url.ts";
import { createIUrls } from "@utils/create-i-urls.ts";
import Kia from "kia";

export const tunnel = new Command()
  .description("Start ngrok tunnel for App.")
  .option(
    "-i, --instance-url <instanceUrl:string>",
    "Saleor Cloud Instance URL",
    {
      required: true,
    },
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
  .action(async (options) => {
    console.log();
    console.log(
      `Starting the tunnel for application running at port ${options.port}`,
    );

    const localManifestUrl =
      `http://localhost:${options.port}${options.manifestPath}`;

    const kiaTestLocal = new Kia(
      `Test if manifest is available at ${
        colors.bold.underline(localManifestUrl)
      }...`,
    );

    const localEndpointAvailable = await isEndpointAvailable(localManifestUrl);
    if (localEndpointAvailable) {
      kiaTestLocal.succeed(
        `${localManifestUrl} is responding`,
      );
    } else {
      kiaTestLocal.fail(
        colors.red(
          `Manifest endpoint (${localManifestUrl}) did not responded with code 200`,
        ),
      );
      console.log("Possible issues:");
      console.log("- dev server is not running");
      console.log("- manifest path is not implemented");
      console.log("- theres access control preventing from making an request");
      return;
    }

    const kiaTunnel = new Kia("Starting the ngrok...");
    // check if theres tunnel running before we open ours
    const existingTunnel = await getAvailableTunnels();
    if (existingTunnel.length > 0) {
      // TODO: handle case where there are multiple tunnels running
      kiaTunnel.fail(
        colors.red(
          `Seems theres ngrok tunnel already running - ${existingTunnel[0]}`,
        ),
      );
      console.error(
        "Since free accounts does not support more than one tunnel, tunnel command not implemented yet such scenario",
      );
      return;
    }

    const tunnel = createTunnel(options.port);
    kiaTunnel.set("Waiting for tunnel URL");
    const tunnelUrl = await waitAndGetTunnelUrl(10000) || "";

    if (!tunnelUrl) {
      kiaTunnel.fail(colors.bold.red("Could not get tunnel URL. Aborting."));
      return;
    } else {
      kiaTunnel.succeed("Tunnel established!");
    }

    const iUrls = createIUrls({
      instanceUrl: options.instanceUrl,
      manifestPath: options.manifestPath,
      tunnelUrl: tunnelUrl,
    });

    const kiaTestTunneled = new Kia(
      `Test if tunneled manifest is available at ${
        colors.bold.underline(iUrls.tunneledManifestIUrl.toString())
      }...`,
    );

    const tunneledEndpointAvailable = await isEndpointAvailable(
      iUrls.tunneledManifestIUrl.toString(),
    );
    if (tunneledEndpointAvailable) {
      kiaTestTunneled.succeed(
        `${iUrls.tunneledManifestIUrl.toString()} is available`,
      );
    } else {
      kiaTestTunneled.fail(
        colors.red(
          `Manifest endpoint (${iUrls.tunneledManifestIUrl.toString()}) did not responded with code 200`,
        ),
      );
    }
    console.log();
    console.log();

    const table: Table = new Table(
      [
        "To instal the app, click on: ",
        colors.underline.yellow(iUrls.tunneledInstallIUrl.toString()),
      ],
      [
        "Inspect traffic: ",
        colors.underline.yellow("http://localhost:4040/inspect/http"),
      ],
      [
        "Tunnel started at URL:",
        colors.underline.yellow(iUrls.tunnelIUrl.toString()),
      ],
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
        await openBrowser(iUrls.tunnelIUrl.toString());
      } else if (event.key === "t") {
        await openBrowser("http://localhost:4040/inspect/http");
      } else if (event.key === "i") {
        await openBrowser(iUrls.tunneledInstallIUrl.toString());
      }
    }

    tunnel.kill("SIGTERM");
    console.log();
    console.log(`Thank you for flying with ${NAME}`);
  });
