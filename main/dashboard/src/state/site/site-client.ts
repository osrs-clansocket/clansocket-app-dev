import { imageToPng } from "../../shared/converters/image-png-converter.js";
import { sameOriginFetch } from "../../shared/fetchers/same-origin-fetcher.js";
import type { InitialState } from "../../managers/voxlab/app/voxlab-editor.js";

export const SITE_VOXLAB_PUBLISH_URL = "/api/site/logo-record";

export interface SiteOwnerStatus {
    isOwner: boolean;
    logoVersion?: string | null;
}

export async function ownerStatus(): Promise<SiteOwnerStatus> {
    try {
        const res = await sameOriginFetch("/api/site/me");
        if (!res.ok) return { isOwner: false };
        return (await res.json()) as SiteOwnerStatus;
    } catch {
        return { isOwner: false };
    }
}

export async function logoRecord(): Promise<InitialState | null> {
    try {
        const res = await sameOriginFetch("/api/site/logo-record");
        if (!res.ok) return null;
        const env = (await res.json()) as InitialState | null;
        if (!env?.mesh) return null;
        return env;
    } catch {
        return null;
    }
}

export async function uploadSiteImage(file: File): Promise<boolean> {
    let pngBlob: Blob;
    try {
        pngBlob = await imageToPng(file);
    } catch {
        return false;
    }
    const form = new FormData();
    // eslint-disable-next-line lvi/no-raw-dom -- FormData.append, not DOM
    form.append("file", pngBlob, "logo.png");
    try {
        const res = await sameOriginFetch("/api/site/logo", {
            method: "POST",
            body: form,
        });
        return res.ok;
    } catch {
        return false;
    }
}

async function parseEnvelope(file: File): Promise<{ text: string; valid: boolean } | null> {
    try {
        const text = await file.text();
        const parsed = JSON.parse(text);
        const valid = typeof parsed === "object" && parsed !== null && "mesh" in parsed;
        return { text, valid };
    } catch {
        return null;
    }
}

export async function uploadEnvelope(file: File): Promise<boolean> {
    const env = await parseEnvelope(file);
    if (!env || !env.valid) return false;
    const form = new FormData();
    // eslint-disable-next-line lvi/no-raw-dom -- FormData.append, not DOM
    form.append("envelope", env.text);
    try {
        const res = await sameOriginFetch("/api/site/logo-record", { method: "POST", body: form });
        return res.ok;
    } catch {
        return false;
    }
}
