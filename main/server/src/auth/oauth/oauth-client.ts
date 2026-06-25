import { MIME_FORM_URLENCODED, MIME_JSON } from "../../shared/http/http-mime.js";

export function buildOauthUrl(baseUrl: string, params: Record<string, string>): string {
    return `${baseUrl}?${new URLSearchParams(params).toString()}`;
}

export async function oauthExchange(
    tokenUrl: string,
    bodyParams: Record<string, string>,
    label: string,
): Promise<string> {
    const res = await fetch(tokenUrl, {
        method: "POST",
        headers: { Accept: MIME_JSON, "Content-Type": MIME_FORM_URLENCODED },
        body: new URLSearchParams(bodyParams).toString(),
    });
    if (!res.ok) throw new Error(`${label}_token_exchange_failed status=${res.status}`);
    const json = (await res.json()) as { access_token?: string; error?: string; error_description?: string };
    if (!json.access_token) {
        throw new Error(`${label}_token_exchange_failed: ${json.error_description ?? json.error ?? "no_access_token"}`);
    }
    return json.access_token;
}

export async function oauthFetchUser<T>(
    userUrl: string,
    accessToken: string,
    label: string,
    extraHeaders: Record<string, string> = {},
): Promise<T> {
    const res = await fetch(userUrl, {
        headers: {
            Authorization: `Bearer ${accessToken}`,
            "User-Agent": "clansocket",
            ...extraHeaders,
        },
    });
    if (!res.ok) throw new Error(`${label}_user_fetch_failed status=${res.status}`);
    return (await res.json()) as T;
}
