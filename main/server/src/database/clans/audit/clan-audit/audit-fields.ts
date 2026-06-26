import type Database from "better-sqlite3";
import { DB_NAMES, getDb } from "../../../core/database.js";
import { lookupAction, type AnyAuditAction } from "../clan-audit-registry/index.js";
import { getLastHash } from "./chain.js";
import type { RecordAuditArgs } from "./record-types.js";

export interface EnrichedAudit {
    payload: Record<string, unknown>;
    elapsedMs: number | null;
    requestId: string | null;
}

export interface InsertArgs<A extends AnyAuditAction> {
    db: Database.Database;
    clanId: string;
    entry: RecordAuditArgs<A>;
    enriched: EnrichedAudit;
    now: number;
}

export interface AuditFields {
    source: string;
    schemaVersion: number;
    targetType: string | null;
    targetId: string | null;
    targetName: string | null;
    payloadJson: string;
    prevHash: string | null;
}

function sourceFromAction(action: string): string {
    const colon = action.indexOf(":");
    return colon === -1 ? "server" : action.slice(0, colon);
}

function resolveTargetName(targetType: string | null, targetId: string | null): string | null {
    if (targetType === null || targetId === null) return null;
    const appDb = getDb(DB_NAMES.APP);
    if (targetType === "clan") {
        const row = appDb.prepare("SELECT display_name FROM clansocket_clans WHERE id = ?").get(targetId) as
            | { display_name: string }
            | undefined;
        return row?.display_name ?? null;
    }
    if (targetType === "account" || targetType === "site_account" || targetType === "manager") {
        const row = appDb.prepare("SELECT display_name FROM clansocket_accounts WHERE id = ?").get(targetId) as
            | { display_name: string }
            | undefined;
        return row?.display_name ?? null;
    }
    return null;
}

export function resolveAuditFields<A extends AnyAuditAction>(a: InsertArgs<A>): AuditFields {
    const def = lookupAction(a.entry.action);
    const targetType = def?.targetType ?? null;
    const targetId = a.entry.targetId ?? null;
    return {
        targetType,
        targetId,
        source: def?.source ?? sourceFromAction(a.entry.action),
        schemaVersion: def?.schemaVersion ?? 1,
        targetName: resolveTargetName(targetType, targetId),
        payloadJson: JSON.stringify(a.enriched.payload),
        prevHash: getLastHash(a.db),
    };
}
