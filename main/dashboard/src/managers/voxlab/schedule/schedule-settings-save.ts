import { SETTINGS_SAVE_DEBOUNCE_MS } from "../app/app-manager/app-manager-build.js";
import type { ScheduleDeps } from "./schedule-types.js";

export function scheduleSettingsSave(deps: ScheduleDeps): void {
    if (!deps.persistedRestored() || deps.snapshot.isRestoring || deps.hostManagedState()) return;
    if (deps.state.settingsSaveTimer !== null) clearTimeout(deps.state.settingsSaveTimer);
    deps.state.settingsSaveTimer = window.setTimeout(() => {
        deps.state.settingsSaveTimer = null;
        if (deps.snapshot.isRestoring) return;
        const snap = deps.snapshot.capture();
        deps.persistence.saveSettings(snap);
        deps.history.record(snap);
    }, SETTINGS_SAVE_DEBOUNCE_MS);
}
