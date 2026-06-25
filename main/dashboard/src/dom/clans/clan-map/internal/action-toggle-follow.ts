import type { MapStateSignals } from "./state.js";

export function toggleFollow(state: MapStateSignals, hash: string): void {
    state.followedHash$.set(state.followedHash$() === hash ? null : hash);
    if (state.followedHash$() !== null) state.mode$.set("manual");
}
