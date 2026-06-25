import { PresetsPanelComponent } from "../../../../dom/forms/voxlab/panels/presets-panel-component.js";
import type { SnapshotManager } from "../../snapshot-manager.js";
import type { PanelDeps } from "./panel-deps.js";

export function mountPresetsPanel(deps: PanelDeps): PresetsPanelComponent {
    const p = new PresetsPanelComponent({
        storage: deps.presetStorage,
        onApply: (d) => deps.onPresetApply(d.snapshot as ReturnType<SnapshotManager["capture"]>),
        onSaveCurrent: () => deps.snapshot.capture(),
    });
    p.mount(deps.footer.presetsContainer);
    return p;
}
