import { effect, type Disposable } from "../../../../factory/reactive/index.js";
import type { MapStateSignals } from "../state.js";

export function bindAlertAnimation(state: MapStateSignals): Disposable {
    let rafHandle = 0;
    const tick = (): void => {
        rafHandle = 0;
        if (state.alertedHashes$().size === 0) return;
        state.paintTick$.set(state.paintTick$() + 1);
        rafHandle = window.requestAnimationFrame(tick);
    };
    const eff = effect(() => {
        if (state.alertedHashes$().size > 0 && rafHandle === 0) {
            rafHandle = window.requestAnimationFrame(tick);
        }
    });
    return {
        dispose: () => {
            eff.dispose();
            if (rafHandle !== 0) window.cancelAnimationFrame(rafHandle);
        },
    };
}
