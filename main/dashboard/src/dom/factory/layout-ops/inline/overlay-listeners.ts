import type { OverlayContext, OverlayState } from "./overlay-context-types.js";
import { positionOverlay } from "./overlay-anchor.js";

const EVT_KEYDOWN = "keydown";
const EVT_SCROLL = "scroll";
const EVT_RESIZE = "resize";

export function bindWindowEvents(reposition: () => void, onKey: (e: KeyboardEvent) => void): void {
    document.addEventListener(EVT_KEYDOWN, onKey);
    window.addEventListener(EVT_SCROLL, reposition, true);
    window.addEventListener(EVT_RESIZE, reposition);
}

export function makeRepositionFn(state: OverlayState, ctx: OverlayContext): () => void {
    return () => {
        if (state.actionsRef !== null) positionOverlay(state.actionsRef.el, ctx.trigger, ctx.anchor);
    };
}
