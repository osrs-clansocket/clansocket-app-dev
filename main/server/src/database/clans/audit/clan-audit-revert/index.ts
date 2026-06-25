import logger from "@clansocket/logger";
import { clanAuditDb } from "../../../core/database.js";
import { ClanAuditActions } from "../clan-audit-actions.js";
import { applyBrandingRevert } from "./branding.js";
import { applyClaimRevert } from "./claim.js";
import { applyGrantRevert, applyRevokeRevert } from "./manager.js";
import { isRevertable, type RevertResult, type SourceEntry } from "./types.js";
import { applyWhitelistRevert } from "./whitelist.js";

export { REVERTABLE_ACTIONS, isRevertable, type RevertResult } from "./types.js";

const REVERT_APPLIERS: Record<
    string,
    (clanId: string, row: SourceEntry, payload: Record<string, unknown>, by: string) => void
> = {
    [ClanAuditActions.BrandingUpdated]: applyBrandingRevert,
    [ClanAuditActions.ManagerGranted]: applyGrantRevert,
    [ClanAuditActions.ManagerRevoked]: applyRevokeRevert,
    [ClanAuditActions.ClaimTransferred]: applyClaimRevert,
    [ClanAuditActions.WhitelistAdded]: (clanId, row, _payload, by) => applyWhitelistRevert(clanId, row, by),
};

function countCascade(clanDb: ReturnType<typeof clanAuditDb>, row: SourceEntry): number {
    if (row.target_id === null) return 0;
    const counter = clanDb
        .prepare(`SELECT COUNT(*) AS n FROM clan_audit_log WHERE target_id = ? AND id > ? AND action = ?`)
        .get(row.target_id, row.id, row.action) as { n: number };
    return counter.n;
}

interface RevertGate {
    row: SourceEntry;
    payload: Record<string, unknown>;
    applier: (clanId: string, row: SourceEntry, payload: Record<string, unknown>, by: string) => void;
}

function gateRevert(clanDb: ReturnType<typeof clanAuditDb>, auditId: number): RevertGate | { reason: string } {
    const row = clanDb
        .prepare(`SELECT id, actor_site_account_id, action, target_id, payload_json FROM clan_audit_log WHERE id = ?`)
        .get(auditId) as SourceEntry | undefined;
    if (!row) return { reason: "entry_not_found" };
    if (!isRevertable(row.action)) return { reason: "action_not_revertable" };
    const payload = row.payload_json === null ? {} : (JSON.parse(row.payload_json) as Record<string, unknown>);
    if (payload.revertsAuditId !== undefined) return { reason: "already_a_revert" };
    const applier = REVERT_APPLIERS[row.action];
    if (!applier) return { reason: "action_not_revertable" };
    return { row, payload, applier };
}

export function revertAuditEntry(clanId: string, auditId: number, revertedBySiteAccountId: string): RevertResult {
    const clanDb = clanAuditDb(clanId);
    const gate = gateRevert(clanDb, auditId);
    if ("reason" in gate) return { ok: false, reason: gate.reason };
    const cascadeCount = countCascade(clanDb, gate.row);
    try {
        gate.applier(clanId, gate.row, gate.payload, revertedBySiteAccountId);
    } catch (err) {
        logger.error(
            `[clansocket_audit] revert failed for ${gate.row.action} id=${gate.row.id}: ${(err as Error).message}`,
        );
        return { ok: false, reason: "revert_failed" };
    }
    const newId = clanDb.prepare("SELECT MAX(id) AS id FROM clan_audit_log").get() as { id: number };
    return { ok: true, newAuditId: newId.id, cascadeCount };
}
