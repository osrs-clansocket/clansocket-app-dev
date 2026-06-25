import { authedFetch } from "./authed-fetcher.js";

type MutationMethod = "POST" | "PATCH" | "PUT" | "DELETE";

export async function authedJsonFetch(
    path: string,
    method: MutationMethod,
    body: unknown,
    extraInit: RequestInit = {},
): Promise<Response> {
    return authedFetch(path, { ...extraInit, method, body: JSON.stringify(body) });
}
