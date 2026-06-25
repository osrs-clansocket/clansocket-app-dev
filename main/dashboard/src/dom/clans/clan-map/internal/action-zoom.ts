import type { ReadSignal } from "../../../factory/reactive/index.js";
import type { PositionsState } from "../../../../state/clans/stores/positions-store.js";
import type { MapStateSignals } from "./state.js";
import { clampToAtlas } from "./atlas-clamper.js";
import { computeNextViewport } from "./viewport-computer.js";

export function zoomByFactor(state: MapStateSignals, positions$: ReadSignal<PositionsState>, factor: number): void {
    const { next, followed } = computeNextViewport({ state, positions$, factor });
    state.viewport$.set(clampToAtlas(next));
    if (!followed) state.mode$.set("manual");
}
