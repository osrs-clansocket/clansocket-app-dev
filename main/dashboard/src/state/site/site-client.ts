import { imageToPng } from "../../shared/converters/image-png-converter.js";
import { sameOriginFetch } from "../../shared/fetchers/same-origin-fetcher.js";

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
