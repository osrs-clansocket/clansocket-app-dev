import { sameOriginFetch } from "./same-origin-fetcher.js";

type MutationMethod = "POST" | "PATCH" | "PUT" | "DELETE";

export function jsonFetch(url: RequestInfo, method: MutationMethod, body: unknown): Promise<Response> {
    return sameOriginFetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
    });
}
