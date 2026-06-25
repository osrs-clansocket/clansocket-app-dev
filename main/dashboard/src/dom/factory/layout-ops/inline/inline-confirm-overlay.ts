import { type Instance } from "../../core";
import type { OverlayContext, OverlayState } from "./overlay-context-types.js";
import { bindWindowEvents, makeRepositionFn, tearDownOverlay } from "./overlay-teardown.js";

export type { OverlayContext } from "./overlay-context-types.js";
export { positionOverlay, findAnchor, triggerAnchor } from "./overlay-anchor.js";

const KEY_ESCAPE = "Escape";

export function startOverlay(
    ctx: OverlayContext,
    pendingHosts: WeakMap<Instance, () => void>,
): { settle: (result: boolean) => void; bindActions: (a: Instance) => void } {
    const state: OverlayState = { settled: false, actionsRef: null };
    const reposition = makeRepositionFn(state, ctx);
    const onKey = (e: KeyboardEvent): void => {
        if (e.key !== KEY_ESCAPE) return;
        e.preventDefault();
        settle(false);
    };
    const settle = (result: boolean): void => {
        if (state.settled) return;
        state.settled = true;
        tearDownOverlay({ ctx, reposition, onKey, pendingHosts, actionsRef: state.actionsRef });
        ctx.resolve(result);
    };
    bindWindowEvents(reposition, onKey);
    return {
        settle,
        bindActions: (a) => {
            state.actionsRef = a;
        },
    };
}
