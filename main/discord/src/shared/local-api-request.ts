import http from "node:http";
import { orThrow } from "./nullable.js";
import https from "node:https";
import config from "../core/config.js";

const BEHIND_PROXY = process.env.BEHIND_PROXY === "1";
const SCHEME = BEHIND_PROXY ? "http" : "https";

export function requireApiToken(): string {
    return orThrow(process.env.API_TOKEN, "API_TOKEN not set");
}

export function localApiUrl(path: string): URL {
    return new URL(`${SCHEME}://localhost:${config.api.port}${path}`);
}

export function selectLib(url: URL): typeof http | typeof https {
    return url.protocol === "https:" ? https : http;
}

export function authedRequestOpts(
    token: string,
    method: string,
    extraHeaders: Record<string, string> = {},
): https.RequestOptions {
    return {
        method,
        headers: { ...extraHeaders, Authorization: `Bearer ${token}` },
        rejectUnauthorized: false,
    };
}
