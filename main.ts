import { Command } from "cliffy/command/mod.ts";
import { DESCRIPTION, NAME, VERSION } from "./src/const.ts";
import { tunnel } from "./src/commands/tunnel.ts";
import { metadata } from "./src/commands/metadata.ts";

await new Command()
  .name(NAME)
  .version(VERSION)
  .description(DESCRIPTION)
  .command("tunnel", tunnel)
  .command("metadata", metadata)
  .parse(Deno.args);
