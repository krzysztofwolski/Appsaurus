export async function openBrowser(url: string): Promise<void> {
  const programAliases = {
    windows: "explorer",
    darwin: "open",
    linux: "sensible-browser",
  };
  const process = Deno.run({ cmd: [programAliases[Deno.build.os], url] });
  await process.status();
}
