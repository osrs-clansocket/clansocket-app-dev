import { seoById, recordClanAudit, updateClanSeo, type ClanSeoPatch, type ClanSeoRow } from "../../database/index.js";
import { ClanAuditActions } from "../../database/clans/audit/clan-audit-actions.js";

import { MS_PER_MINUTE } from "../../shared/time.js";

const MAX_TITLE_LEN = 80;
const MAX_DESCRIPTION_LEN = 300;
const MAX_URL_LEN = 500;
const PUBLIC_FLIP_COOLDOWN_MINUTES = 5;
export const PUBLIC_FLIP_COOLDOWN_MS = PUBLIC_FLIP_COOLDOWN_MINUTES * MS_PER_MINUTE;

function trimToNull(raw: unknown, max: number): string | null | undefined {
    if (raw === undefined) return undefined;
    if (raw === null) return null;
    if (typeof raw !== "string") return undefined;
    const trimmed = raw.trim();
    if (trimmed.length === 0) return null;
    if (trimmed.length > max) return undefined;
    return trimmed;
}

function parseBool(raw: unknown): boolean | undefined {
    return typeof raw === "boolean" ? raw : undefined;
}

export function buildPatch(body: Record<string, unknown>): ClanSeoPatch | null {
    const title = trimToNull(body.title, MAX_TITLE_LEN);
    const description = trimToNull(body.description, MAX_DESCRIPTION_LEN);
    const image = trimToNull(body.image, MAX_URL_LEN);
    const isPublic = parseBool(body.isPublic);
    if (title === undefined && description === undefined && image === undefined && isPublic === undefined) {
        return null;
    }
    const patch: ClanSeoPatch = {};
    if (title !== undefined) patch.title = title;
    if (description !== undefined) patch.description = description;
    if (image !== undefined) patch.image = image;
    if (isPublic !== undefined) patch.isPublic = isPublic;
    return patch;
}

export function projectManagerSeo(row: ClanSeoRow): Record<string, unknown> {
    return {
        title: row.seo_title,
        description: row.seo_description,
        image: row.seo_image,
        isPublic: row.is_public === 1,
        displayName: row.display_name,
        publicToggledAt: row.public_toggled_at,
    };
}

export function flipCooldown(row: ClanSeoRow, patch: ClanSeoPatch, nowMs: number): number {
    if (patch.isPublic === undefined) return 0;
    if (patch.isPublic === (row.is_public === 1)) return 0;
    if (row.public_toggled_at === null) return 0;
    const elapsed = nowMs - row.public_toggled_at;
    return elapsed >= PUBLIC_FLIP_COOLDOWN_MS ? 0 : PUBLIC_FLIP_COOLDOWN_MS - elapsed;
}

export interface ApplyPatchArgs {
    clanId: string;
    siteAccountId: string;
    patch: ClanSeoPatch;
    current: ClanSeoRow;
    nowMs: number;
}

export function applySeoPatch(a: ApplyPatchArgs): ClanSeoRow | null {
    const isPublicFlip = a.patch.isPublic !== undefined && a.patch.isPublic !== (a.current.is_public === 1);
    updateClanSeo(a.clanId, a.patch, isPublicFlip ? a.nowMs : undefined);
    recordClanAudit(a.clanId, {
        actor: a.siteAccountId,
        action: ClanAuditActions.SeoUpdated,
        targetId: a.clanId,
        payload: { fields: Object.keys(a.patch) },
    });
    return seoById(a.clanId);
}
