import { clanAuditDb } from "../../../core/database.js";
import { CLAN_INACTIVITY_THRESHOLD_MS } from "../../../../shared/clan/clan-retention.js";
import { parseDecimal } from "../../../../shared/parsers/decimal-parser.js";
import { MS_PER_DAY } from "../../../../shared/time.js";

const SETTING_KEY_LAST_PRUNE = "clan_audit_log.last_prune_at";
const PRUNE_GATE_MS = MS_PER_DAY;
const AUDIT_RETENTION_MS = CLAN_INACTIVITY_THRESHOLD_MS;

export function pruneOldAudit(clanId: string): { pruned: number; ran: boolean } {
    const settingsDb = clanAuditDb(clanId);
    const settingRow = settingsDb
        .prepare("SELECT value FROM clan_audit_settings WHERE key = ?")
        .get(SETTING_KEY_LAST_PRUNE) as { value: string | null } | undefined;
    const lastPruneAt = settingRow?.value ? parseDecimal(settingRow.value) : 0;
    const now = Date.now();
    if (Number.isFinite(lastPruneAt) && now - lastPruneAt < PRUNE_GATE_MS) {
        return { pruned: 0, ran: false };
    }
    const cutoff = now - AUDIT_RETENTION_MS;
    const result = settingsDb.prepare("DELETE FROM clan_audit_log WHERE ts < ?").run(cutoff);
    settingsDb
        .prepare(
            `INSERT INTO clan_audit_settings (key, value, updated_at)
             VALUES (?, ?, ?)
             ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at`,
        )
        .run(SETTING_KEY_LAST_PRUNE, String(now), now);
    return { pruned: result.changes, ran: true };
}

export function anonymizeActor(clanId: string, siteAccountId: string): number {
    const result = clanAuditDb(clanId)
        .prepare("UPDATE clan_audit_log SET actor_site_account_id = NULL WHERE actor_site_account_id = ?")
        .run(siteAccountId);
    return result.changes;
}
