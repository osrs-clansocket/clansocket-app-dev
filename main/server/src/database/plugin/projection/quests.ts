import type Database from "better-sqlite3";
import type { ChangeEmitter } from "./change-inserter.js";
import { buildChangeEmitter } from "./change-inserter.js";
import type { EventEnvelopeCols } from "./envelope.js";
import type { HandlerCtx } from "./handler-ctx.js";
import {
    asNumberNullable,
    asString,
    asStringNullable,
    extractWhere,
    type PlayerIdentity,
    type SpatialColumns,
} from "./projection-utils.js";

interface QuestEntry {
    id: number;
    name?: string;
    state?: string;
}

function readPriorState(conn: Database.Database, accountHash: string, questId: number): string | null {
    const row = conn
        .prepare("SELECT state FROM plugin_quests WHERE account_hash = ? AND quest_id = ?")
        .get(accountHash, questId) as { state: string } | undefined;
    return row?.state ?? null;
}

interface UpsertQuestArgs {
    conn: Database.Database;
    id: PlayerIdentity;
    questId: number;
    questName: string;
    state: string;
    now: number;
}

function upsertQuest(args: UpsertQuestArgs): void {
    const { conn, id, questId, questName, state, now } = args;
    conn.prepare(
        `INSERT INTO plugin_quests (account_hash, rsn, quest_id, quest_name, state, first_seen, last_seen, updated_at)
         VALUES ($accountHash, $rsn, $questId, $questName, $state, $now, $now, $now)
         ON CONFLICT (account_hash, quest_id) DO UPDATE SET
            rsn = excluded.rsn,
            quest_name = excluded.quest_name,
            state = excluded.state,
            last_seen = excluded.last_seen,
            updated_at = CASE
                WHEN state != excluded.state OR quest_name != excluded.quest_name
                THEN excluded.updated_at
                ELSE updated_at
            END`,
    ).run({ rsn: id.rsn ?? "", accountHash: id.accountHash, questId, questName, state, now });
}

interface QuestChangeArgs {
    emitter: ChangeEmitter;
    id: PlayerIdentity;
    envelope: EventEnvelopeCols;
    where: SpatialColumns;
    questId: number;
    questName: string;
    stateBefore: string;
    stateAfter: string;
}

function emitQuestChange(args: QuestChangeArgs): void {
    const { emitter, id, envelope, where, questId, questName, stateBefore, stateAfter } = args;
    emitter.emit({
        id,
        envelope,
        where,
        dedupKind: "quest_change",
        dedupParts: [questId, stateBefore, stateAfter],
        specific: [questId, questName, stateBefore, stateAfter],
    });
}

const QUEST_CHANGE_COLS = ["quest_id", "quest_name", "state_before", "state_after"];

interface ProcessQuestArgs {
    conn: Database.Database;
    emitter: ChangeEmitter;
    id: PlayerIdentity;
    envelope: EventEnvelopeCols;
    where: SpatialColumns;
    accountHash: string;
    now: number;
    entry: QuestEntry;
}

function processQuestEntry(args: ProcessQuestArgs): void {
    const { conn, emitter, id, envelope, where, accountHash, now, entry } = args;
    const questId = asNumberNullable(entry.id);
    const state = asStringNullable(entry.state);
    if (questId === null || state === null) return;
    const name = asString(entry.name, "");
    const prior = readPriorState(conn, accountHash, questId);
    if (prior !== null && prior !== state) {
        emitQuestChange({
            emitter,
            id,
            envelope,
            where,
            questId,
            questName: name,
            stateBefore: prior,
            stateAfter: state,
        });
    }
    upsertQuest({ conn, id, now, questId, state, questName: name });
}

export function handleQuests(ctx: HandlerCtx): void {
    const { conn, payload, now, envelope, id } = ctx;
    const { accountHash } = id;
    const quests: QuestEntry[] = Array.isArray(payload.quests) ? payload.quests : [];
    const where = extractWhere(payload);
    const emitter = buildChangeEmitter(conn, "plugin_quests_changes", QUEST_CHANGE_COLS);
    conn.transaction(() => {
        for (const entry of quests) {
            processQuestEntry({ conn, emitter, id, envelope, where, accountHash, now, entry });
        }
    })();
}

export function handleQuestCompleted(ctx: HandlerCtx): void {
    const { conn, payload, now, envelope, id } = ctx;
    const { accountHash } = id;
    const questId = asNumberNullable(payload.id);
    const questName = asString(payload.name, "");
    if (questId === null) return;
    const where = extractWhere(payload);
    const emitter = buildChangeEmitter(conn, "plugin_quests_changes", QUEST_CHANGE_COLS);
    conn.transaction(() => {
        const prior = readPriorState(conn, accountHash, questId) ?? "IN_PROGRESS";
        emitQuestChange({
            emitter,
            id,
            envelope,
            where,
            questId,
            questName,
            stateBefore: prior,
            stateAfter: "COMPLETE",
        });
        upsertQuest({ conn, id, questId, questName, now, state: "COMPLETE" });
    })();
}
