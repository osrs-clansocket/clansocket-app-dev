import { ERROR_CLAN_NOT_FOUND } from "../../../shared/error-reasons.js";
import { HTTP_NOT_FOUND } from "../../../shared/http/http-status.js";

import { type Request, type Response } from "express";
import { ClanAuditActions, DB_NAMES, getDb, recordClanAudit } from "../../../database/index.js";
import { requireSiteAccount } from "../../../auth/site-middleware.js";
import { loadOwnedClan } from "../../load-owned-clan.js";
import { brandingSnapshot } from "../../branding-snapshot.js";
import { mountedRouter } from "../_mount-registry.js";

const MAX_ICON_VALUE_LEN = 200;
const MAX_COLOR_LEN = 32;

function parseIconKind(value: unknown): "builtin" | "image" | null {
    return value === "builtin" || value === "image" ? value : null;
}

function parseClippedString(value: unknown, maxLen: number): string | null {
    return typeof value === "string" && value.length > 0 ? value.slice(0, maxLen) : null;
}

interface PriorBranding {
    icon_kind: string | null;
    icon_value: string | null;
    color: string | null;
}

interface BrandingPatch {
    iconKind: "builtin" | "image" | null;
    iconValue: string | null;
    color: string | null;
}

function applyBrandingPatch(clanId: string, patch: BrandingPatch): PriorBranding | undefined {
    const db = getDb(DB_NAMES.APP);
    const prior = db.prepare(`SELECT icon_kind, icon_value, color FROM clansocket_clans WHERE id = ?`).get(clanId) as
        | PriorBranding
        | undefined;
    db.prepare(`UPDATE clansocket_clans SET icon_kind = ?, icon_value = ?, color = ? WHERE id = ?`).run(
        patch.iconKind,
        patch.iconValue,
        patch.color,
        clanId,
    );
    return prior;
}

function auditBranding(
    clanId: string,
    siteAccountId: string,
    prior: PriorBranding | undefined,
    patch: BrandingPatch,
): void {
    recordClanAudit(clanId, {
        actor: siteAccountId,
        action: ClanAuditActions.BrandingUpdated,
        targetId: clanId,
        payload: {
            before: prior ? brandingSnapshot(prior.icon_kind, prior.icon_value, prior.color) : null,
            after: brandingSnapshot(patch.iconKind, patch.iconValue, patch.color),
        },
    });
}

const router = mountedRouter();

router.put("/:slug/branding", requireSiteAccount, (req: Request, res: Response) => {
    const siteAccountId = req.siteAccountId!;
    const owned = loadOwnedClan(String(req.params.slug ?? "").toLowerCase(), siteAccountId);
    if (!owned) {
        res.status(HTTP_NOT_FOUND).json({ error: ERROR_CLAN_NOT_FOUND });
        return;
    }
    const { iconKind, iconValue, color } = (req.body ?? {}) as {
        iconKind?: unknown;
        iconValue?: unknown;
        color?: unknown;
    };
    const patch: BrandingPatch = brandingSnapshot(
        parseIconKind(iconKind),
        parseClippedString(iconValue, MAX_ICON_VALUE_LEN),
        parseClippedString(color, MAX_COLOR_LEN),
    ) as BrandingPatch;
    const prior = applyBrandingPatch(owned.id, patch);
    auditBranding(owned.id, siteAccountId, prior, patch);
    res.json({ ok: true, ...patch });
});

export default router;
