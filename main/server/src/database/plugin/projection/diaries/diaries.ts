import type Database from "better-sqlite3";
import type { ChangeEmitter } from "../change-inserter.js";
import { buildChangeEmitter } from "../change-inserter.js";
import { readPriorTier, upsertDiary } from "./diaries-store.js";
import type { EventEnvelopeCols } from "../envelope.js";
import type { HandlerCtx } from "../handler-ctx.js";
import {
    asStringNullable,
    deriveDiaryId,
    deriveDiaryName,
    extractWhere,
    type PlayerIdentity,
    type SpatialColumns,
} from "../projection-utils.js";
import { EVENT_DIARIES, EVENT_DIARY_COMPLETED } from "../../../../plugin-api/event-types.js";
import { registerPluginEvent } from "../../../../flows/registries/plugin-event-registry.js";

interface DiaryEntry {
    region: string;
    tier: string;
    complete?: boolean;
}

interface DiaryChangeArgs {
    emitter: ChangeEmitter;
    id: PlayerIdentity;
    envelope: EventEnvelopeCols;
    where: SpatialColumns;
    diaryId: string;
    diaryName: string;
    region: string;
    tierBefore: string | null;
    tierAfter: string;
}

function emitDiaryChange(args: DiaryChangeArgs): void {
    const { emitter, id, envelope, where, diaryId, diaryName, region, tierBefore, tierAfter } = args;
    emitter.emit({
        id,
        envelope,
        where,
        dedupKind: "diary_change",
        dedupParts: [diaryId, tierBefore ?? "", tierAfter],
        specific: [diaryId, diaryName, region, tierBefore, tierAfter],
    });
}

const DIARY_CHANGE_COLS = ["diary_id", "diary_name", "diary_region", "tier_before", "tier_after"];

interface ProcessDiaryArgs {
    conn: Database.Database;
    emitter: ChangeEmitter;
    id: PlayerIdentity;
    envelope: EventEnvelopeCols;
    where: SpatialColumns;
    accountHash: string;
    now: number;
    entry: DiaryEntry;
}

interface DerivedDiary {
    diaryId: string;
    diaryName: string;
    region: string;
    tier: string;
}

function deriveDiary(region: string, tier: string): DerivedDiary {
    return { region, tier, diaryId: deriveDiaryId(region, tier), diaryName: deriveDiaryName(region, tier) };
}

function extractDiary(source: { region?: unknown; tier?: unknown }): DerivedDiary | null {
    const region = asStringNullable(source.region);
    const tier = asStringNullable(source.tier);
    if (region === null || tier === null) return null;
    return deriveDiary(region, tier);
}

function processDiaryEntry(args: ProcessDiaryArgs): void {
    const { conn, emitter, id, envelope, where, accountHash, now, entry } = args;
    const d = extractDiary(entry);
    if (d === null) return;
    const prior = readPriorTier(conn, accountHash, d.diaryId);
    if (prior !== null && prior !== d.tier) {
        emitDiaryChange({ emitter, id, envelope, where, ...d, tierBefore: prior, tierAfter: d.tier });
    }
    upsertDiary({ conn, id, now, ...d, complete: entry.complete ? 1 : 0 });
}

export function handleDiaries(ctx: HandlerCtx): void {
    const { conn, payload, now, envelope, id } = ctx;
    const { accountHash } = id;
    const diaries: DiaryEntry[] = Array.isArray(payload.diaries) ? payload.diaries : [];
    const where = extractWhere(payload);
    const emitter = buildChangeEmitter(conn, "plugin_diaries_changes", DIARY_CHANGE_COLS);
    conn.transaction(() => {
        for (const entry of diaries) {
            processDiaryEntry({ conn, emitter, id, envelope, where, accountHash, now, entry });
        }
    })();
}

registerPluginEvent({
    eventType: EVENT_DIARIES,
    routing: "current-state",
    handler: handleDiaries,
    payloadFields: [{ name: "diaries", type: "string" }],
});

export function handleDiaryCompleted(ctx: HandlerCtx): void {
    const { conn, payload, now, envelope, id } = ctx;
    const { accountHash } = id;
    const d = extractDiary(payload);
    if (d === null) return;
    const where = extractWhere(payload);
    const emitter = buildChangeEmitter(conn, "plugin_diaries_changes", DIARY_CHANGE_COLS);
    conn.transaction(() => {
        const prior = readPriorTier(conn, accountHash, d.diaryId);
        emitDiaryChange({ emitter, id, envelope, where, ...d, tierBefore: prior, tierAfter: d.tier });
        upsertDiary({ conn, id, now, ...d, complete: 1 });
    })();
}

registerPluginEvent({
    eventType: EVENT_DIARY_COMPLETED,
    routing: "current-state",
    handler: handleDiaryCompleted,
    payloadFields: [
        { name: "region", type: "string" },
        { name: "tier", type: "string" },
    ],
});
