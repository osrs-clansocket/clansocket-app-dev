import http from "node:http";
import https from "node:https";
import config from "../core/config.js";

const BEHIND_PROXY = process.env.BEHIND_PROXY === "1";
const SCHEME = BEHIND_PROXY ? "http" : "https";

export function requireApiToken(): string {
    const token = process.env.API_TOKEN;
    if (!token) throw new Error("API_TOKEN not set");
    return token;
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
