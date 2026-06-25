import { identityClient } from "../../identity/identity-client/index.js";
import { jsonOrFallback } from "../../fetch-result.js";
import { sameOriginFetch } from "../../../shared/fetchers/same-origin-fetcher.js";
import type { PublishPayload } from "../../../managers/voxlab/app/voxlab-editor.js";
import {
    mapCustomizeError,
    mapUploadError,
    readErrorBody,
    type BrandingUpdate,
    type CustomizeResult,
    type IconTransform,
    type UploadResult,
} from "./branding-types.js";

export type { BrandingUpdate, ClanIconKind, CustomizeResult, IconTransform, UploadResult } from "./branding-types.js";

export async function updateClanBranding(slug: string, update: BrandingUpdate): Promise<BrandingUpdate | null> {
    const res = await identityClient.authedFetch(`/api/clans/${encodeURIComponent(slug)}/branding`, {
        method: "PUT",
        body: JSON.stringify(update),
    });
    return jsonOrFallback<BrandingUpdate | null>(res, null);
}

export async function uploadClanIcon(slug: string, file: File): Promise<UploadResult> {
    const fd = new FormData();
    // eslint-disable-next-line lvi/no-raw-dom
    fd.append("icon", file);
    const res = await sameOriginFetch(`/api/clans/${encodeURIComponent(slug)}/branding/upload`, {
        method: "POST",
        body: fd,
    });
    if (res.ok) {
        return { ok: true, update: (await res.json()) as BrandingUpdate };
    }
    const body = await readErrorBody<{ error?: string; maxBytes?: number; mime?: string }>(res);
    return (body && mapUploadError(body)) ?? { ok: false, reason: "upload_failed" };
}

export async function customizeClanBranding(slug: string, transform: IconTransform): Promise<CustomizeResult> {
    const res = await identityClient.authedFetch(`/api/clans/${encodeURIComponent(slug)}/branding/customize`, {
        method: "POST",
        body: JSON.stringify(transform),
    });
    if (res.ok) {
        const body = (await res.json()) as { imageVersion?: number; transform?: IconTransform };
        return {
            ok: true,
            imageVersion: body.imageVersion ?? Date.now(),
            transform: body.transform ?? transform,
        };
    }
    const body = await readErrorBody<{ error?: string; sourceExt?: string; detail?: string }>(res);
    return (body && mapCustomizeError(body)) ?? { ok: false, reason: "failed" };
}

function serializeVoxlabEnvelope(payload: PublishPayload): string {
    return JSON.stringify({
        payloadVersion: payload.payloadVersion,
        mesh: {
            positions: Array.from(payload.mesh.positions),
            indices: Array.from(payload.mesh.indices),
            normals: Array.from(payload.mesh.normals),
            colors: Array.from(payload.mesh.colors),
            metadata: payload.mesh.metadata,
        },
        snapshot: payload.snapshot,
        timeline: payload.timeline,
        sourceAlbedoImage: payload.sourceAlbedoImage,
    });
}

export async function publishVoxlab(
    slug: string,
    payload: PublishPayload,
    endpointOverride?: string,
): Promise<BrandingUpdate | null> {
    const fd = new FormData();
    // eslint-disable-next-line lvi/no-raw-dom
    fd.append("envelope", serializeVoxlabEnvelope(payload));
    // eslint-disable-next-line lvi/no-raw-dom
    fd.append("thumbnail", payload.thumbnailPng, "thumbnail.png");
    const url = endpointOverride ?? `/api/clans/${encodeURIComponent(slug)}/branding/voxlab-publish`;
    const res = await identityClient.authedFetch(url, { method: "POST", body: fd });
    return jsonOrFallback<BrandingUpdate | null>(res, null);
}

export async function clearBranding(slug: string): Promise<{ ok: boolean; imageVersion: number }> {
    const res = await identityClient.authedFetch(`/api/clans/${encodeURIComponent(slug)}/branding/customize/clear`, {
        method: "POST",
        body: "{}",
    });
    if (!res.ok) return { ok: false, imageVersion: Date.now() };
    const body = (await res.json()) as { imageVersion?: number };
    return { ok: true, imageVersion: body.imageVersion ?? Date.now() };
}
