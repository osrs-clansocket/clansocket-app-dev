import type { MapStateSignals } from "./state.js";

export function toggleAlert(state: MapStateSignals, hash: string): void {
    const cur = state.alertedHashes$();
    const next = new Set(cur);
    if (next.has(hash)) next.delete(hash);
    else next.add(hash);
    state.alertedHashes$.set(next);
}
