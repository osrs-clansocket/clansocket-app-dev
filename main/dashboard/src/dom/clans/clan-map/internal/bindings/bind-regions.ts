import { effect, type Disposable, type ReadSignal } from "../../../../factory/reactive/index.js";
import type { PositionsState } from "../../../../../state/clans/stores/positions-store.js";
import { updateAtlasCache } from "../atlas-state.js";

export function bindRegions(positions$: ReadSignal<PositionsState>): Disposable {
    return effect(() => updateAtlasCache(positions$().mapMeta));
}
