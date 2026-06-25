import logger from "@clansocket/logger";
import { deleteMissing } from "../../database/site/runewatch/delete-missing-cases.js";
import { updateRunewatchCooldown } from "../../database/site/runewatch/cooldown-update.js";
import { upsertRunewatchCases } from "../../database/site/runewatch/upsert-cases.js";
import { fetchRunewatchMixedlist } from "../client/fetch-client.js";
import { parseRunewatchRows } from "./parse-rows.js";
import { captureFlagSnapshot, emitClanTransitions, type TransitionSummary } from "./compute-clan-transitions.js";
import { isFetchAllowed } from "./sync-cooldown.js";

export interface SyncRunewatchResult {
    ok: boolean;
    reason?: string;
    cooldownActive?: boolean;
    inserted?: number;
    updated?: number;
    deleted?: number;
    hardCount?: number;
    softCount?: number;
    transitions?: TransitionSummary;
}

export interface SyncRunewatchOptions {
    manual?: boolean;
    forceBypassCooldown?: boolean;
}

function handleFetchFailure(now: number, reason: string): void {
    updateRunewatchCooldown({
        last_fetch_at: now,
        last_fetch_status: reason === "http_error" ? "http_error" : "parse_error",
        last_case_count: 0,
        last_hard_count: 0,
        last_soft_count: 0,
        last_inserted: 0,
        last_updated: 0,
        last_deleted: 0,
    });
}

interface SuccessArgs {
    now: number;
    rowCount: number;
    hardCount: number;
    softCount: number;
    inserted: number;
    updated: number;
    deleted: number;
}

function recordSyncSuccess(a: SuccessArgs): void {
    updateRunewatchCooldown({
        last_fetch_at: a.now,
        last_fetch_status: "ok",
        last_case_count: a.rowCount,
        last_hard_count: a.hardCount,
        last_soft_count: a.softCount,
        last_inserted: a.inserted,
        last_updated: a.updated,
        last_deleted: a.deleted,
    });
}

interface SuccessfulSync {
    rows: ReturnType<typeof parseRunewatchRows>;
    inserted: number;
    updated: number;
    deleted: number;
    hardCount: number;
    softCount: number;
    transitions: ReturnType<typeof emitClanTransitions>;
}

function runSuccessfulSync(
    rows: ReturnType<typeof parseRunewatchRows>,
    before: ReturnType<typeof captureFlagSnapshot>,
): SuccessfulSync {
    const seenKeys = new Set(rows.map((r) => r.case_key));
    const { inserted, updated } = upsertRunewatchCases(rows);
    const deleted = deleteMissing(seenKeys);
    const transitions = emitClanTransitions(before, captureFlagSnapshot());
    const hardCount = rows.filter((r) => r.tier === "hard").length;
    return { rows, inserted, updated, deleted, hardCount, transitions, softCount: rows.length - hardCount };
}

function finalizeSyncOk(s: ReturnType<typeof runSuccessfulSync>, now: number, manual: boolean): SyncRunewatchResult {
    recordSyncSuccess({
        now,
        rowCount: s.rows.length,
        hardCount: s.hardCount,
        softCount: s.softCount,
        inserted: s.inserted,
        updated: s.updated,
        deleted: s.deleted,
    });
    logger.info(
        `runewatch.sync ok manual=${manual} ins=${s.inserted} upd=${s.updated} del=${s.deleted} hard=${s.hardCount} soft=${s.softCount} transitions=${JSON.stringify(s.transitions)}`,
    );
    return {
        ok: true,
        inserted: s.inserted,
        updated: s.updated,
        deleted: s.deleted,
        hardCount: s.hardCount,
        softCount: s.softCount,
        transitions: s.transitions,
    };
}

export async function syncRunewatchCases(opts: SyncRunewatchOptions = {}): Promise<SyncRunewatchResult> {
    const now = Date.now();
    if (!opts.forceBypassCooldown && !isFetchAllowed(now)) {
        return { ok: false, reason: "cooldown", cooldownActive: true };
    }
    const fetchResult = await fetchRunewatchMixedlist();
    if (!fetchResult.ok) {
        handleFetchFailure(now, fetchResult.reason);
        logger.warn(`runewatch.sync fetch failed reason=${fetchResult.reason} detail=${fetchResult.detail}`);
        return { ok: false, reason: fetchResult.reason };
    }
    const before = captureFlagSnapshot();
    const s = runSuccessfulSync(parseRunewatchRows(fetchResult.rows, now), before);
    return finalizeSyncOk(s, now, opts.manual === true);
}
