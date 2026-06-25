import { scheduleSettingsSave } from "./schedule-settings-save.js";
import type { ScheduleDeps } from "./schedule-types.js";

export function scheduleRecorderFlush(deps: ScheduleDeps): void {
    if (deps.state.recorderRafPending) return;
    deps.state.recorderRafPending = true;
    requestAnimationFrame(() => {
        deps.state.recorderRafPending = false;
        deps.recorder.recordChange();
        scheduleSettingsSave(deps);
    });
}
