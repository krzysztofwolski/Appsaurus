export const createTunnel = (port: number) => {
  return Deno.run({
    cmd: ["ngrok", "http", port.toString()],
    stdout: "null",
    stderr: "null",
  });
};
