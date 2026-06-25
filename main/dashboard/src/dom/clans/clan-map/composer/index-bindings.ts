import type { Disposable } from "../../../factory/reactive/index.js";
import type { scratchCanvas } from "../../../factory/content-ops";
import { mapRegionsStore } from "../../../../state/clans/stores/map-regions-store.js";
import type { BlipPositionAnimator } from "../paint/animators/blip-position-animator.js";
import type { MapStateSignals } from "../internal/state.js";
import type { TileCache } from "../paint/caches/tile-cache.js";
import {
    bindAlertAnimation,
    bindAutoViewport,
    bindCanvasAspect,
    bindFollow,
    bindHover,
    bindPaint,
    bindPan,
    bindPrefetch,
    bindRegions,
    bindZoom,
} from "../internal/bindings/index.js";
import type { ClanMapProps } from "../clan-map-types.js";

export interface MountedRefs {
    bg: ReturnType<typeof scratchCanvas>;
    overlay: ReturnType<typeof scratchCanvas>;
}

export interface BindingsCtx {
    state: MapStateSignals;
    props: ClanMapProps;
    refs: MountedRefs;
    cache: TileCache;
    blipAnimator: BlipPositionAnimator;
}

function buildPaintBinding(c: BindingsCtx): Disposable {
    return bindPaint({
        positions$: c.props.positions$,
        regions$: mapRegionsStore.regions$,
        state: c.state,
        refs: { bg: c.refs.bg.el, overlay: c.refs.overlay.el },
        cache: c.cache,
        blipAnimator: c.blipAnimator,
    });
}

export function setupBindings(c: BindingsCtx): Disposable[] {
    const { state, props, refs, cache, blipAnimator } = c;
    return [
        bindRegions(props.positions$),
        bindAutoViewport(props.positions$, state),
        bindCanvasAspect(state),
        buildPaintBinding(c),
        bindPrefetch(state, cache),
        bindPan(refs.overlay.el, state),
        bindZoom(refs.overlay.el, state, props.positions$),
        bindHover(refs.overlay.el, mapRegionsStore.regions$, props.positions$, state),
        bindFollow(props.positions$, state, blipAnimator),
        bindAlertAnimation(state),
    ];
}
