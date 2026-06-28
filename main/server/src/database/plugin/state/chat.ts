import type { Database } from "better-sqlite3";
import { sha256Hex } from "../../../shared/hash.js";
import { getClanDb } from "../../core/database.js";
import { dispatchSafe } from "../projection/auto-hook-dispatcher.js";
import { lookupAccountType } from "./lookup-account-type.js";
import { registerTrigger } from "../../../flows/registries/trigger-registry.js";

const CLAN_CHAT_TRIGGER = "clan_chat";

registerTrigger({
    capability: "plugin",
    triggerId: CLAN_CHAT_TRIGGER,
    eventSource: "plugin.clan_chat",
    routing: "synthetic",
    payloadFields: [
        { name: "rsn", type: "rsn", valueSourceRef: "rsn" },
        { name: "senderRsn", type: "rsn", valueSourceRef: "rsn" },
        { name: "message", type: "string" },
        { name: "kind", type: "string" },
        { name: "world", type: "integer" },
        { name: "rank", type: "clan-rank", valueSourceRef: "clan-rank" },
        { name: "accountType", type: "string" },
    ],
});

export interface ClanChatRecord {
    sessionId: string;
    accountHash: string;
    rsn: string;
    senderRsn: string;
    world: number;
    kind: string;
    text: string;
    timestampMs: number;
    eventTs: number;
    schemaVersion?: number;
}

function chatDedupHash(record: ClanChatRecord): string {
    return sha256Hex(`${record.accountHash}|${record.kind}|${record.senderRsn}|${record.text}|${record.eventTs}`);
}

function lookupSenderRank(db: Database, senderRsn: string): string | null {
    const row = db.prepare("SELECT rank FROM clan_members WHERE member_name = ? LIMIT 1").get(senderRsn) as
        | { rank: string | null }
        | undefined;
    return row?.rank ?? null;
}

function insertChatRow(db: ReturnType<typeof getClanDb>, record: ClanChatRecord): boolean {
    const result = db
        .prepare(
            `INSERT INTO clan_chats
                (account_hash, rsn, session_id, session_seq,
                 event_received_at,
                 sender_rsn, kind, text, world,
                 dedup_hash)
             VALUES (?, ?, ?, 0, ?, ?, ?, ?, ?, ?)
             ON CONFLICT(dedup_hash) DO NOTHING`,
        )
        .run(
            record.accountHash,
            record.rsn,
            record.sessionId,
            record.timestampMs,
            record.senderRsn,
            record.kind,
            record.text,
            record.world,
            chatDedupHash(record),
        );
    return result.changes > 0;
}

function dispatchHooks(clanId: string, db: ReturnType<typeof getClanDb>, record: ClanChatRecord): void {
    const rank = lookupSenderRank(db, record.senderRsn);
    const accountType = lookupAccountType(clanId, record.senderRsn);
    dispatchSafe({
        clanId,
        triggerType: CLAN_CHAT_TRIGGER,
        rsn: record.senderRsn,
        payload: {
            rsn: record.senderRsn,
            senderRsn: record.senderRsn,
            message: record.text,
            kind: record.kind,
            world: record.world,
            rank,
            accountType,
        },
    });
}

export function recordChat(clanId: string, record: ClanChatRecord): boolean {
    const db = getClanDb(clanId);
    const inserted = insertChatRow(db, record);
    if (inserted) dispatchHooks(clanId, db, record);
    return inserted;
}
