import type { ReadSignal } from "../../../../factory/reactive/index.js";
import type { PositionsState } from "../../../../../state/clans/stores/positions-store.js";
import type { BlipPositionAnimator } from "../../paint/animators/blip-position-animator.js";
import type { MapStateSignals } from "../state.js";
import { clampToAtlas } from "../atlas-clamper.js";
import { followedWorldCoords } from "./follow-coords.js";

interface FollowedTickArgs {
    row: NonNullable<ReturnType<PositionsState["byHash"]["get"]>>;
    mapMeta: NonNullable<PositionsState["mapMeta"]>;
    animator: BlipPositionAnimator;
    hash: string;
    state: MapStateSignals;
}

function applyFollowedTick(args: FollowedTickArgs): void {
    const { row, mapMeta, animator, hash, state } = args;
    const { ix, iy } = followedWorldCoords(row, mapMeta, animator, hash);
    const v = state.viewport$();
    const newX = ix - v.w / 2;
    const newY = iy - v.h / 2;
    if (newX !== v.x || newY !== v.y) {
        state.viewport$.set(clampToAtlas({ x: newX, y: newY, w: v.w, h: v.h }));
    }
    if (state.activePlane$() !== row.location_plane) {
        state.activePlane$.set(row.location_plane);
    }
}

interface FollowTickDeps {
    positions$: ReadSignal<PositionsState>;
    state: MapStateSignals;
    animator: BlipPositionAnimator;
    rafRef: { v: number };
}

export function makeFollowTick(d: FollowTickDeps): () => void {
    const tick = (): void => {
        d.rafRef.v = 0;
        const hash = d.state.followedHash$();
        if (hash === null) return;
        const ps = d.positions$();
        const row = ps.byHash.get(hash);
        if (row !== undefined && ps.mapMeta !== null) {
            applyFollowedTick({ row, hash, mapMeta: ps.mapMeta, animator: d.animator, state: d.state });
        }
        d.rafRef.v = window.requestAnimationFrame(tick);
    };
    return tick;
}
