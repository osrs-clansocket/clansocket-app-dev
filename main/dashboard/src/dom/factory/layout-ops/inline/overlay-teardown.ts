import { type Instance } from "../../core";
import type { OverlayContext } from "./overlay-context-types.js";

export { bindWindowEvents, makeRepositionFn } from "./overlay-listeners.js";

const CLASS_PENDING = "glass-inline-confirm";
const EVT_KEYDOWN = "keydown";
const EVT_SCROLL = "scroll";
const EVT_RESIZE = "resize";

export interface TearDownArgs {
    ctx: OverlayContext;
    actionsRef: Instance | null;
    reposition: () => void;
    onKey: (e: KeyboardEvent) => void;
    pendingHosts: WeakMap<Instance, () => void>;
}

export function tearDownOverlay(args: TearDownArgs): void {
    const { ctx, actionsRef, reposition, onKey, pendingHosts } = args;
    pendingHosts.delete(ctx.host);
    document.removeEventListener(EVT_KEYDOWN, onKey);
    window.removeEventListener(EVT_SCROLL, reposition, true);
    window.removeEventListener(EVT_RESIZE, reposition);
    ctx.host.el.classList.remove(CLASS_PENDING);
    ctx.trigger.style.visibility = ctx.prevVisibility;
    if (actionsRef !== null) actionsRef.destroy();
    ctx.trigger.focus();
}
