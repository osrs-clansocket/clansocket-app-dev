import type Database from "better-sqlite3";
import { execMutation } from "../../../core/db-mutations.js";
import type { DealtFacts, TakenFacts } from "./combat-facts.js";

const DEALT_UPDATE_SQL = `UPDATE plugin_current_state
    SET last_damage_dealt_at = $now, last_damage_dealt_amount = $amount,
        last_damage_dealt_hitsplat_id = $hitsplatId,
        last_damage_dealt_target_kind = $targetKind, last_damage_dealt_target_id = $targetId,
        last_damage_dealt_target_name = $targetName, last_seen = $now, updated_at = $now
    WHERE account_hash = $accountHash`;

const TAKEN_UPDATE_SQL = `UPDATE plugin_current_state
    SET last_damage_taken_at = $now, last_damage_taken_amount = $amount,
        last_damage_taken_hitsplat_id = $hitsplatId,
        last_damage_taken_source_kind = $sourceKind, last_damage_taken_source_id = $sourceId,
        last_damage_taken_source_name = $sourceName, last_seen = $now, updated_at = $now
    WHERE account_hash = $accountHash`;

export function updateDealtCurrent(conn: Database.Database, accountHash: string, facts: DealtFacts, now: number): void {
    execMutation(conn, DEALT_UPDATE_SQL, {
        now,
        accountHash,
        amount: facts.amount,
        hitsplatId: facts.hitsplatId,
        targetKind: facts.targetKind,
        targetId: facts.targetId,
        targetName: facts.targetName,
    });
}

export function updateTakenCurrent(conn: Database.Database, accountHash: string, facts: TakenFacts, now: number): void {
    execMutation(conn, TAKEN_UPDATE_SQL, {
        now,
        accountHash,
        amount: facts.amount,
        hitsplatId: facts.hitsplatId,
        sourceKind: facts.sourceKind,
        sourceId: facts.sourceId,
        sourceName: facts.sourceName,
    });
}
