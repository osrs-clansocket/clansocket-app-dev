import { parseResponse } from "../parsers/response-parser.js";
import { authedRequestOpts, localApiUrl, requireApiToken, selectLib } from "../shared/local-api-request.js";

export function apiRequest<T>(method: string, path: string, body?: object): Promise<T | null> {
    const token = requireApiToken();
    const url = localApiUrl(path);
    const lib = selectLib(url);
    const opts = authedRequestOpts(token, method, { "Content-Type": "application/json" });
    return new Promise((resolve, reject) => {
        const req = lib.request(url, opts, (res) => parseResponse<T>(res, resolve, reject, path));
        req.on("error", reject);
        if (body !== undefined) req.write(JSON.stringify(body));
        req.end();
    });
}

export function apiGet<T>(path: string): Promise<T | null> {
    return apiRequest<T>("GET", path);
}
