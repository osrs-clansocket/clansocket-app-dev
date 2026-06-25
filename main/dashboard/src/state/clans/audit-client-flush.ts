import { jsonFetch } from "../../shared/fetchers/json-fetcher.js";
import { getBuffer, getCurrentSlug } from "./audit-client-state.js";

export function batchUrl(slug: string): string {
    return `/api/clans/${encodeURIComponent(slug)}/manage/audit/batch`;
}

export async function flush(slugOverride?: string | null): Promise<void> {
    const buffer = getBuffer();
    if (buffer.length === 0) return;
    const slug = slugOverride !== undefined ? slugOverride : getCurrentSlug();
    if (slug === null) return;
    const entries = buffer.splice(0);
    try {
        await jsonFetch(batchUrl(slug), "POST", { entries });
    } catch {
        return;
    }
}

export function flushBeacon(): void {
    const buffer = getBuffer();
    const slug = getCurrentSlug();
    if (buffer.length === 0 || slug === null) return;
    const data = JSON.stringify({ entries: buffer.splice(0) });
    const blob = new Blob([data], { type: "application/json" });
    navigator.sendBeacon(batchUrl(slug), blob);
}
