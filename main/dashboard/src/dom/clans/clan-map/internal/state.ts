import { effect, signal, type Disposable, type Signal } from "../../../factory/reactive/index.js";
import { DEFAULT_H, DEFAULT_PLANE, DEFAULT_W } from "../../../../shared/constants/clan/clan-map-constants.js";
import type { AtlasBox } from "../../../../shared/types/view-types.js";
import type { MapRegion } from "../../../../state/clans/stores/map-regions-store.js";
import { persistedScope, readStored, writeStored } from "../../../../state/persistence/index.js";
import type { ViewMode } from "../controls/controls.js";
import { MAP_STATE_BOX } from "./state-box.js";
import type { MapStateDims } from "./state-dims.js";

export { MAP_STATE_BOX } from "./state-box.js";
export type { MapStateDims } from "./state-dims.js";

const ALERTED_HASHES_KEY = "clan-map.alertedHashes";

export interface CanvasRefs {
    bg: HTMLCanvasElement;
    overlay: HTMLCanvasElement;
}

export interface MapStateSignals {
    viewport$: Signal<AtlasBox>;
    mode$: Signal<ViewMode>;
    activePlane$: Signal<number>;
    gridVisible$: Signal<boolean>;
    hoverRegion$: Signal<MapRegion | null>;
    canvasDims$: Signal<MapStateDims>;
    followedHash$: Signal<string | null>;
    alertedHashes$: Signal<ReadonlySet<string>>;
    paintTick$: Signal<number>;
    namesVisible$: Signal<boolean>;
    lastKnownVisible$: Signal<boolean>;
    hoveredBlipHash$: Signal<string | null>;
    mergedLayersVisible$: Signal<boolean>;
}

export function makeStateSignals(): { state: MapStateSignals; persistDisposer: Disposable } {
    const settings = persistedScope("clan-map");
    const initialAlerted = readStored<string[]>(ALERTED_HASHES_KEY) ?? [];
    const alertedHashes$ = signal<ReadonlySet<string>>(new Set<string>(initialAlerted));
    const persistDisposer = effect(() => writeStored(ALERTED_HASHES_KEY, Array.from(alertedHashes$())));
    const state: MapStateSignals = {
        alertedHashes$,
        viewport$: settings.json<AtlasBox>("viewport", MAP_STATE_BOX),
        mode$: settings.json<ViewMode>("mode", "auto"),
        activePlane$: settings.number("activePlane", DEFAULT_PLANE),
        gridVisible$: settings.boolean("gridVisible", false),
        hoverRegion$: signal<MapRegion | null>(null),
        canvasDims$: signal<MapStateDims>({ w: DEFAULT_W, h: DEFAULT_H }),
        followedHash$: settings.json<string | null>("followedHash", null),
        paintTick$: signal<number>(0),
        namesVisible$: settings.boolean("namesVisible", true),
        lastKnownVisible$: settings.boolean("lastKnownVisible", false),
        hoveredBlipHash$: signal<string | null>(null),
        mergedLayersVisible$: settings.boolean("mergedLayersVisible", true),
    };
    return { state, persistDisposer };
}
