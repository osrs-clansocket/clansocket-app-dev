import { DB_NAMES, getDb } from "../../../core/database.js";
import { brandingSnapshot, type BrandingSnapshot } from "../../../../clans/branding-snapshot.js";
import { ClanAuditActions } from "../clan-audit-actions.js";
import { recordClanAudit } from "../clan-audit/record.js";
import type { SourceEntry } from "./types.js";

function swapBranding(clanId: string, before: BrandingSnapshot): BrandingSnapshot | undefined {
    const db = getDb(DB_NAMES.APP);
    const current = db.prepare(`SELECT icon_kind, icon_value, color FROM clansocket_clans WHERE id = ?`).get(clanId) as
        | { icon_kind: string | null; icon_value: string | null; color: string | null }
        | undefined;
    db.prepare(`UPDATE clansocket_clans SET icon_kind = ?, icon_value = ?, color = ? WHERE id = ?`).run(
        before.iconKind,
        before.iconValue,
        before.color,
        clanId,
    );
    return current ? brandingSnapshot(current.icon_kind, current.icon_value, current.color) : undefined;
}

export function applyBrandingRevert(
    clanId: string,
    row: SourceEntry,
    payload: Record<string, unknown>,
    actor: string,
): void {
    const before = payload.before as BrandingSnapshot | null;
    const after = payload.after as BrandingSnapshot | null;
    if (!before) throw new Error(`no_before_state: clanId=${clanId} auditId=${row.id}`);
    const currentShape = swapBranding(clanId, before);
    recordClanAudit(clanId, {
        actor,
        action: ClanAuditActions.BrandingUpdated,
        targetId: clanId,
        payload: {
            before: currentShape ?? after,
            after: before,
            revertsAuditId: row.id,
        },
    });
}
