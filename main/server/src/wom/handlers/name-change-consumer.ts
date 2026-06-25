import logger from "@clansocket/logger";
import { getClanDb } from "../../database/core/database.js";
import { ClanAuditActions } from "../../database/clans/audit/clan-audit-actions.js";
import { recordClanAudit } from "../../database/clans/audit/clan-audit/record.js";
import { clanWomIdentity } from "../../database/wom/identity/get-clan-identity.js";
import { canonicalRsn } from "../../database/site/rsn/canonicalize.js";
import { propagateRsnChange } from "../../database/site/rsn/propagate.js";
import { upsertVerifiedRsn } from "../../database/site/rsn/upsert.js";
import { placeholderAccountHash, isPlaceholder } from "../builders/placeholder-hash-builder.js";
import type { MappedNameChange } from "../mappers/name-changes-mapper.js";

export interface NameChangeConsume {
    applied: number;
    skipped: number;
}

interface AccountRow {
    account_hash: string;
}

const LOOKUP_SQL = `SELECT account_hash FROM clan_accounts WHERE latest_rsn = ? COLLATE NOCASE LIMIT 1`;

function findHashRsn(clanId: string, rsn: string): string | null {
    const row = getClanDb(clanId).prepare(LOOKUP_SQL).get(rsn) as AccountRow | undefined;
    return row?.account_hash ?? null;
}

type ClanWomIdentity = ReturnType<typeof clanWomIdentity>;

function resolveAccountHash(clanId: string, change: MappedNameChange, identity: ClanWomIdentity): string | null {
    const realHash = findHashRsn(clanId, change.oldRsn);
    if (realHash !== null) return realHash;
    if (!identity) return null;
    return placeholderAccountHash(identity.wom_group_id, change.oldRsn.toLowerCase());
}

function recordApplied(clanId: string, change: MappedNameChange, isPlaceholder: boolean): void {
    recordClanAudit(clanId, {
        actor: "wom-name-change-consumer",
        actorKind: "system",
        action: ClanAuditActions.WomRsnChanged,
        targetId: String(change.womChangeId),
        payload: {
            from: change.oldRsn,
            to: change.newRsn,
            accountHashType: isPlaceholder ? "placeholder" : "real",
            womChangeId: change.womChangeId,
        },
    });
}

function applyNameChange(clanId: string, change: MappedNameChange, identity: ClanWomIdentity): boolean {
    if (change.status !== "approved") return false;
    const hash = resolveAccountHash(clanId, change, identity);
    if (hash === null) return false;
    try {
        const isPlaceholderHash = isPlaceholder(hash);
        if (isPlaceholderHash) propagateRsnChange(hash, canonicalRsn(change.newRsn));
        else upsertVerifiedRsn(hash, change.newRsn, "wom");
        recordApplied(clanId, change, isPlaceholderHash);
        return true;
    } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        logger.warn(`[wom-name-change] failed clan=${clanId} ${change.oldRsn}->${change.newRsn}: ${message}`);
        return false;
    }
}

export function consumeChanges(clanId: string, changes: readonly MappedNameChange[]): NameChangeConsume {
    const identity = clanWomIdentity(clanId);
    let applied = 0;
    let skipped = 0;
    for (const change of changes) {
        if (applyNameChange(clanId, change, identity)) applied += 1;
        else skipped += 1;
    }
    return { applied, skipped };
}
