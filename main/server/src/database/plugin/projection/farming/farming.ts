import type Database from "better-sqlite3";
import logger from "@clansocket/logger";
import { decodeFarmingPatch, classifyFarmingDecode, type FarmingDecodeInput } from "@clansocket/farm";
import { buildChangeEmitter } from "../change-inserter.js";
import type { HandlerCtx } from "../handler-ctx.js";
import { emitFarmingChange, FARMING_CHANGE_COLS, upsertFarming } from "./farming-writer.js";
import { extractWhere, type SpatialColumns } from "../projection-utils.js";

function readPriorState(
    conn: Database.Database,
    accountHash: string,
    patchRegionId: number,
    varbitId: number,
): string | null {
    const row = conn
        .prepare(
            `SELECT state FROM plugin_farming
             WHERE account_hash = ? AND patch_region_id = ? AND varbit_id = ?`,
        )
        .get(accountHash, patchRegionId, varbitId) as { state: string } | undefined;
    return row?.state ?? null;
}

function logDecodeMiss(input: FarmingDecodeInput): void {
    const miss = classifyFarmingDecode(input);
    if (miss === null || miss === "out-of-bounds") return;
    logger.warn(
        `farming decode miss (${miss}): varbit=${input.varbitId} value=${input.value} region=${input.regionId} x=${input.x} y=${input.y} plane=${input.plane}`,
    );
}

function buildDecodeInput(varbitId: number, value: number, where: SpatialColumns): FarmingDecodeInput | null {
    if (where.region_id === null || where.x === null || where.y === null || where.plane === null) return null;
    return {
        varbitId,
        value,
        regionId: where.region_id,
        x: where.x,
        y: where.y,
        plane: where.plane,
    };
}

export function handleFarmingPatch(ctx: HandlerCtx): void {
    const { conn, payload, now, envelope, id } = ctx;
    const varbitId = typeof payload.varbitId === "number" ? payload.varbitId : null;
    const value = typeof payload.value === "number" ? payload.value : null;
    if (varbitId === null || value === null) return;
    const where = extractWhere(payload);
    const decodeInput = buildDecodeInput(varbitId, value, where);
    if (decodeInput === null) return;
    const decoded = decodeFarmingPatch(decodeInput);
    if (decoded === null) {
        logDecodeMiss(decodeInput);
        return;
    }
    const emitter = buildChangeEmitter(conn, "plugin_farming_changes", FARMING_CHANGE_COLS);
    conn.transaction(() => {
        const prior = readPriorState(conn, id.accountHash, decoded.patchRegionId, varbitId);
        if (prior !== null && prior !== decoded.state) {
            emitFarmingChange({ emitter, id, envelope, where, decoded, varbitId, prior });
        }
        upsertFarming({ conn, id, decoded, varbitId, value, now });
    })();
}
