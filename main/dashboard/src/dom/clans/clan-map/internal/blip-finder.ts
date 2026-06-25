import type { PositionsState } from "../../../../state/clans/stores/positions-store.js";

export const BLIP_HIT_RADIUS_DEV_PX = 18;

interface BlipHitOpts {
    ps: PositionsState;
    plane: number;
    view: { scale: number; offsetX: number; offsetY: number };
    mouseCx: number;
    mouseCy: number;
    radius: number;
}

export function blipUnderCursor({ ps, plane, view, mouseCx, mouseCy, radius }: BlipHitOpts): string | null {
    if (ps.mapMeta === null) return null;
    const r2 = radius * radius;
    for (const row of ps.byHash.values()) {
        if (row.location_plane !== plane) continue;
        const ix = (row.location_x - ps.mapMeta.origin_world_x) * ps.mapMeta.pixels_per_tile;
        const iy = (ps.mapMeta.top_world_y - row.location_y) * ps.mapMeta.pixels_per_tile;
        const bx = ix * view.scale + view.offsetX;
        const by = iy * view.scale + view.offsetY;
        const dx = bx - mouseCx;
        const dy = by - mouseCy;
        if (dx * dx + dy * dy <= r2) return row.account_hash;
    }
    return null;
}
