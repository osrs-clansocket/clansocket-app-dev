import type { ScheduleDeps } from "./schedule-types.js";

export function scheduleCameraFlush(deps: ScheduleDeps): void {
    if (deps.state.cameraMoveRafPending) return;
    deps.state.cameraMoveRafPending = true;
    requestAnimationFrame(() => {
        deps.state.cameraMoveRafPending = false;
        deps.onCameraMoved();
    });
}
