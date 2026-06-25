import type Database from "better-sqlite3";
import type { ChangeEmitter } from "../change-inserter.js";
import type { EventEnvelopeCols } from "../envelope.js";
import type { PlayerIdentity, SpatialColumns } from "../projection-utils.js";

export interface FarmingDecoded {
    patchRegionId: number;
    patchRegionName: string;
    cropId: number | null;
    cropName: string | null;
    state: string;
}

export const FARMING_CHANGE_COLS: readonly string[] = [
    "patch_region_id",
    "patch_region_name",
    "varbit_id",
    "crop_id",
    "crop_name",
    "state_before",
    "state_after",
];

export interface FarmingChangeArgs {
    emitter: ChangeEmitter;
    id: PlayerIdentity;
    envelope: EventEnvelopeCols;
    where: SpatialColumns;
    decoded: FarmingDecoded;
    varbitId: number;
    prior: string;
}

export function emitFarmingChange(args: FarmingChangeArgs): void {
    const { emitter, id, envelope, where, decoded, varbitId, prior } = args;
    emitter.emit({
        id,
        envelope,
        where,
        dedupKind: "farming_change",
        dedupParts: [decoded.patchRegionId, varbitId, prior, decoded.state],
        specific: [
            decoded.patchRegionId,
            decoded.patchRegionName,
            varbitId,
            decoded.cropId,
            decoded.cropName,
            prior,
            decoded.state,
        ],
    });
}

export interface UpsertFarmingArgs {
    conn: Database.Database;
    id: PlayerIdentity;
    decoded: FarmingDecoded;
    varbitId: number;
    value: number;
    now: number;
}

const FARMING_UPSERT_SQL = `INSERT INTO plugin_farming
    (account_hash, rsn, patch_region_id, patch_region_name, varbit_id,
     crop_id, crop_name, value, state, first_seen, last_seen, updated_at)
 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
 ON CONFLICT (account_hash, patch_region_id, varbit_id) DO UPDATE SET
    rsn = excluded.rsn,
    patch_region_name = excluded.patch_region_name,
    crop_id = COALESCE(excluded.crop_id, crop_id),
    crop_name = COALESCE(excluded.crop_name, crop_name),
    value = excluded.value,
    state = excluded.state,
    last_seen = excluded.last_seen,
    updated_at = CASE
        WHEN state != excluded.state OR value != excluded.value
        THEN excluded.updated_at
        ELSE updated_at
    END`;

export function upsertFarming(args: UpsertFarmingArgs): void {
    const { conn, id, decoded, varbitId, value, now } = args;
    conn.prepare(FARMING_UPSERT_SQL).run(
        id.accountHash,
        id.rsn ?? "",
        decoded.patchRegionId,
        decoded.patchRegionName,
        varbitId,
        decoded.cropId,
        decoded.cropName,
        value,
        decoded.state,
        now,
        now,
        now,
    );
}
