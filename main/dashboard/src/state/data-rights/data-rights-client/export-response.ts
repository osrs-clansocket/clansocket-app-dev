import type { DataRightsError } from "./types.js";

export async function withResponse<T>(
    res: Response,
    onSuccess: () => Promise<T>,
): Promise<T | ({ ok: false } & DataRightsError)> {
    if (res.ok) return onSuccess();
    const err = (await res.json().catch(() => ({}))) as DataRightsError;
    return { ok: false, reason: err.reason ?? "failed", message: err.message, retryAfterMs: err.retryAfterMs };
}
