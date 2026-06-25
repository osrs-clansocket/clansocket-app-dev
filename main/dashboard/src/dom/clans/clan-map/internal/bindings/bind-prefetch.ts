import { effect, type Disposable } from "../../../../factory/reactive/index.js";
import { scheduleOp } from "../../../../factory/scheduler/index.js";
import { viewportToComposite } from "../../paint/calculators/viewport-calculator.js";
import { prefetchTile, type TileCache } from "../../paint/caches/tile-cache.js";
import type { MapStateSignals } from "../state.js";
import { collectPrefetchCoords } from "./prefetch-coords.js";
import { runWorkers } from "./prefetch-workers.js";

export function bindPrefetch(state: MapStateSignals, cache: TileCache): Disposable {
    let gen = 0;
    return effect(() => {
        const plane = state.activePlane$();
        const viewport = state.viewport$();
        const dims = state.canvasDims$();
        const view = viewportToComposite(viewport, dims.w, dims.h);
        const coords = collectPrefetchCoords(viewport, view);
        if (coords.length === 0) return;
        gen++;
        const myGen = gen;
        scheduleOp(() => {
            void runWorkers(
                coords,
                (c) => prefetchTile({ plane, cache, zoom: c.zoom, tx: c.tx, ty: c.ty }),
                () => myGen !== gen,
            );
        }, "idle");
    });
}
