import { Command } from "cliffy/command/mod.ts";
import { DESCRIPTION, NAME, VERSION } from "./src/const.ts";
import { tunnel } from "./src/commands/tunnel.ts";

await new Command()
  .name(NAME)
  .version(VERSION)
  .description(DESCRIPTION)
  .command("tunnel", tunnel)
  .parse(Deno.args);
