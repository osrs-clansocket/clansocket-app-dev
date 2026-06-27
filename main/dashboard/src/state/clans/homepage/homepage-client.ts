import { identityClient } from "../../identity/identity-client/index.js";
import type { HomepageComponent } from "./types.js";

export async function saveHomepageComponents(slug: string, components: HomepageComponent[]): Promise<boolean> {
    try {
        const res = await identityClient.authedJsonFetch(
            `/api/clans/${encodeURIComponent(slug)}/homepage/components`,
            "PUT",
            { components },
            {},
        );
        return res.ok;
    } catch {
        return false;
    }
}

export interface UploadHomepageImageResult {
    readonly ok: boolean;
    readonly key?: string;
    readonly ext?: string;
    readonly version?: number;
    readonly error?: string;
}

export async function uploadHomepageImage(slug: string, file: File): Promise<UploadHomepageImageResult> {
    const fd = new FormData();
    fd.append("image", file);
    try {
        const res = await identityClient.authedFetch(`/api/clans/${encodeURIComponent(slug)}/homepage/images`, {
            method: "POST",
            body: fd,
        });
        const body = (await res.json().catch(() => ({}))) as Partial<UploadHomepageImageResult>;
        return { ...body, ok: res.ok };
    } catch (err) {
        return { ok: false, error: (err as Error).message };
    }
}

export async function deleteHomepageImage(slug: string, key: string): Promise<boolean> {
    try {
        const res = await identityClient.authedFetch(
            `/api/clans/${encodeURIComponent(slug)}/homepage/images/${encodeURIComponent(key)}`,
            { method: "DELETE" },
        );
        return res.ok;
    } catch {
        return false;
    }
}
