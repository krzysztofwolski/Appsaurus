import { Command } from "cliffy/command/mod.ts";
import { Checkbox, Confirm, Input, Select } from "cliffy/prompt/mod.ts";
import Kia from "kia";
import { getAllStashedMetadata } from "../utils/stash/get-all-stashed-metadata.ts";
import { stashMetadata } from "../utils/stash/stash-metadata.ts";
import { Md5 } from "https://deno.land/std@0.153.0/hash/md5.ts";
import { clearStashedMetadata } from "../utils/stash/clear-stashed-metadata.ts";
import { API_TOKEN, INSTANCE_API_URL } from "../const.ts";
import { getInstalledApps } from "../utils/saleor/get-installed-apps.ts";
import { getAppDetails } from "../utils/saleor/get-app-details.ts";

export const metadata = new Command()
  .command(
    "stash",
    "Stash metadata from installed apps.",
  )
  .name("stash")
  .option(
    "-i, --instance-url <instanceUrl:string>",
    "Saleor Cloud Instance URL",
    {
      required: true,
      default: INSTANCE_API_URL,
    },
  )
  .option(
    "-t, --api-token <apiToken:string>",
    "Saleor Cloud Instance Token",
    {
      required: false,
    },
  )
  .action(async (options) => {
    const apiUrl = options.instanceUrl;
    const token = options.apiToken || API_TOKEN;

    const kiaFetchApps = new Kia("Fetching installed apps");
    const apps = await getInstalledApps({ apiUrl, token }).then((resp) => {
      kiaFetchApps.succeed("Apps fetched");
      return resp;
    }).catch(() => {
      kiaFetchApps.fail("Could not fetch apps from the API");
      return [];
    });

    if (apps.length < 1) {
      console.error("No apps to manage");
      return;
    }
    const promptData = await Checkbox.prompt({
      message: "Select applications",
      options: apps.map((a) => ({ value: a.id, name: a.name })),
    });

    const kiaFetchAppDetails = new Kia("Fetching selected apps details.");
    const detailData = await Promise.all(promptData.map(
      async (id) => await getAppDetails({ apiUrl, token, id }),
    )).then((data) => {
      kiaFetchAppDetails.succeed("App details fetched");
      return data;
    }).catch(() => {
      kiaFetchAppDetails.fail("Could not fetch apps from the API");
      return [];
    });

    if (detailData.length < 1) {
      console.error("Could not fetch the details data");
      return;
    }

    const promptName = await Input.prompt({
      message: "Whats the name for the stash?",
      default: (new Date()).toLocaleString("en-US"),
    });

    for (const details of detailData) {
      if (!details || details.privateMetadata.length < 1) {
        continue;
      }

      stashMetadata({
        id: ((new Md5()).update(
          details.id + (new Date()).toLocaleString("en-US"),
        )).toString(),
        appId: details.id,
        appName: details.name,
        name: promptName,
        privateMetadata: details.privateMetadata,
        metadata: details.metadata,
      });
    }
  })
  .command(
    "load",
    "Load stashed metadata to installed app.",
  )
  .name("load")
  .option(
    "-i, --instance-url <instanceUrl:string>",
    "Saleor Cloud Instance URL",
    {
      required: true,
    },
  )
  .action(async (options) => {
    const kiaLoadStash = new Kia("Loading stash");
    const stash = getAllStashedMetadata();
    kiaLoadStash.succeed("Stash loaded");
    if (stash.entries.length < 1) {
      console.error("No stash entries to load");
      return;
    }

    const promptData = await Checkbox.prompt({
      message: "Select stashes you would like to load:",
      minOptions: 1,
      options: stash.entries.map((a) => ({
        value: a.id,
        name: `${a.appName}: ${a.name}`,
      })) || [],
    });

    console.log("pd>", promptData);
    const selectedStashEntries = stash.entries.filter((e) =>
      promptData.includes(e.id)
    );
    console.log("s>", selectedStashEntries);
    const metadata = selectedStashEntries.reduce(
      (p, e) => [...p, ...e.metadata],
      [] as { key: string; value: string }[],
    );
    const privateMetadata = selectedStashEntries.reduce(
      (p, e) => [...p, ...e.privateMetadata],
      [] as { key: string; value: string }[],
    );

    console.log("m>", metadata);
    console.log("pm>", privateMetadata);

    const kiaFetchApps = new Kia("Fetching installed apps");
    const apps = await queryInstalledApps();
    kiaFetchApps.succeed("Apps fetched");
    if (apps.length < 1) {
      console.error("No apps to manage");
      return;
    }
    const promptApplication = await Select.prompt({
      message: "Select applications",
      options: apps.map((a) => ({ value: a.id, name: a.name })) || [],
    });

    await mutateUpdatePrivateMetadata(promptApplication, privateMetadata);
  })
  .command(
    "clear-stash",
    "Clear metadata stash",
  )
  .name("clear-stash")
  .action(async (options) => {
    const promptConfirm = await Confirm.prompt({
      message: "Do you really want to clear the stash?",
    });

    if (!promptConfirm.valueOf()) {
      console.log("Aborting");
      return;
    }
    clearStashedMetadata();
  });
