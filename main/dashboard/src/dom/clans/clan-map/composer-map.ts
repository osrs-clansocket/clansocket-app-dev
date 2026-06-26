import { div } from "../../factory/layout-ops";
import { effect } from "../../factory/reactive/index.js";
import { MAP_HOST_CLASS } from "../../../shared/constants/clan/clan-map-constants.js";
import { setTileRoot } from "./paint/formatters/tile-url-formatter.js";
import { loadManifest } from "./paint/validators/tile-existence-validator.js";
import { makeAnimator } from "./paint/animators/blip-position-animator.js";
import { makeStateSignals } from "./internal/state.js";
import { buildSubviews } from "./composer/index-subviews.js";
import { setupBindings } from "./composer/index-bindings.js";
import { setupResizeObserver, trackAllDisposers } from "./composer/index-lifecycle.js";
import { createTileCache, type TileCache } from "./paint/caches/tile-cache.js";
import { buildMapCanvases } from "./composer/index-canvases.js";
import { attachMapDebug } from "./composer/index-debug.js";
import { buildApi } from "./composer/index-api.js";
import type { ClanMapApi, ClanMapProps } from "./clan-map-types.js";
import { baseProps } from "../../factory/index.js";

export function clanMap(props: ClanMapProps): ClanMapApi {
    void loadManifest();
    const refs = buildMapCanvases();
    const { state, persistDisposer } = makeStateSignals();
    const cache: TileCache = createTileCache();
    const blipAnimator = makeAnimator();
    const bindDisposers = setupBindings({ state, props, refs, cache, blipAnimator });
    const tileRootEff = effect(() => setTileRoot(state.mergedLayersVisible$() ? "tiles-merged" : "tiles"));
    const { controls, minimap, names } = buildSubviews(state, props, blipAnimator);
    const host = div(baseProps([MAP_HOST_CLASS]), [refs.bg, refs.overlay, names, controls, minimap]);
    attachMapDebug(state);
    const observerDisposer = setupResizeObserver(host.el, refs, state.canvasDims$);
    trackAllDisposers(host, { bindDisposers, tileRootEff, observerDisposer, persistDisposer });
    return buildApi(state, props, host);
}
