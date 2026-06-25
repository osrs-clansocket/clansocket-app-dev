import type { PositionsState } from "../../../../state/clans/stores/positions-store.js";

export function followedAtlasPoint(
    positions: PositionsState,
    followedHash: string | null,
): { ax: number; ay: number } | null {
    if (followedHash === null) return null;
    const row = positions.byHash.get(followedHash);
    if (row === undefined || positions.mapMeta === null) return null;
    return {
        ax: (row.location_x - positions.mapMeta.origin_world_x) * positions.mapMeta.pixels_per_tile,
        ay: (positions.mapMeta.top_world_y - row.location_y) * positions.mapMeta.pixels_per_tile,
    };
}
