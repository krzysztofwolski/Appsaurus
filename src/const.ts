import { config } from "https://deno.land/x/dotenv/mod.ts";

export const NAME = "Appsaurus";
export const VERSION = "0.0.1";
export const DESCRIPTION = "CLI, Deno, Saleor apps. Experimental stuff";

// Reference .env.example
export const CONFIG = config({ safe: true });
export const INSTANCE_API_URL = CONFIG["INSTANCE_API_URL"];
export const API_TOKEN = CONFIG["API_TOKEN"];
