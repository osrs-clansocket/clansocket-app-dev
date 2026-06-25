import type { MapStateSignals } from "./state.js";

export function resetView(state: MapStateSignals): void {
    state.mode$.set("auto");
}
