type EndpointListResponse = {
  endpoints?: [{
    public_url: string;
  }];
};

export const getAvailableTunnels = async (): Promise<string[]> => {
  try {
    const p = Deno.run({
      cmd: ["ngrok", "api", "endpoints", "list"],
      stdout: "piped",
      stderr: "null",
    });
    const tunnelsOutput = JSON.parse(
      new TextDecoder().decode(await p.output()),
    ) as EndpointListResponse;
    if (!tunnelsOutput.endpoints || tunnelsOutput.endpoints.length < 1) {
      return [];
    }

    return tunnelsOutput.endpoints.map((endpoint) => endpoint.public_url);
  } catch {
    console.error("Could not run command `ngrok api endpoints list`");
    console.error("Possible possible issues:");
    console.error("- ngrok is not installed");
    console.error("- ngrok token is not valid");
    console.error("- ngrok token is not added to ngrok cli");
    return [];
  }
};
