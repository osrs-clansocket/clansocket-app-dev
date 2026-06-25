import { effect, type Disposable, type ReadSignal } from "../../../../factory/reactive/index.js";
import type { PositionsState } from "../../../../../state/clans/stores/positions-store.js";
import type { BlipPositionAnimator } from "../../paint/animators/blip-position-animator.js";
import type { MapStateSignals } from "../state.js";
import { makeFollowTick } from "./follow-tick.js";

export function bindFollow(
    positions$: ReadSignal<PositionsState>,
    state: MapStateSignals,
    animator: BlipPositionAnimator,
): Disposable {
    const rafRef = { v: 0 };
    const tick = makeFollowTick({ positions$, state, animator, rafRef });
    const eff = effect(() => {
        if (state.followedHash$() !== null && rafRef.v === 0) {
            rafRef.v = window.requestAnimationFrame(tick);
        }
    });
    return {
        dispose: () => {
            eff.dispose();
            if (rafRef.v !== 0) window.cancelAnimationFrame(rafRef.v);
        },
    };
}
