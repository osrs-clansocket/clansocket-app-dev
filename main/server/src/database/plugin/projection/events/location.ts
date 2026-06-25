import { ensureRow } from "../current-state.js";
import type { HandlerCtx } from "../handler-ctx.js";
import type { Payload } from "../projection-utils.js";

function readRegionId(payload: Payload): number | null {
    if (typeof payload.region === "number") return payload.region;
    if (typeof payload.regionId === "number") return payload.regionId;
    return null;
}

export function handleLocation(ctx: HandlerCtx): void {
    const { conn, payload, now } = ctx;
    const { accountHash, rsn } = ctx.id;
    ensureRow(conn, accountHash, rsn, now);
    const x = typeof payload.x === "number" ? payload.x : null;
    const y = typeof payload.y === "number" ? payload.y : null;
    const plane = typeof payload.plane === "number" ? payload.plane : null;
    const regionId = readRegionId(payload);
    const regionName = typeof payload.regionName === "string" ? payload.regionName : null;
    conn.prepare(
        `UPDATE plugin_current_state
            SET location_x = $x, location_y = $y, location_plane = $plane,
                location_region_id = $regionId, location_region_name = $regionName,
                last_seen = $now, updated_at = $now
            WHERE account_hash = $accountHash`,
    ).run({ x, y, plane, regionId, regionName, now, accountHash });
}
