import { ActionsPanelComponent } from "../../../../dom/forms/voxlab/panels/actions-panel-component.js";
import { mountPresetsPanel } from "./panel-mount-presets.js";
import { buildLightPanel } from "./panel-mount-light.js";
import { mountAnimationsPanel } from "./panel-mount-animations.js";
import type { MountAllDeps } from "./panel-deps.js";

export function mountActionsPanel(panel: ActionsPanelComponent, actionsContainer: HTMLElement): void {
    panel.mount(actionsContainer);
}

export function mountAllPanels(deps: MountAllDeps): ActionsPanelComponent {
    mountPresetsPanel(deps);
    buildLightPanel(deps);
    mountAnimationsPanel(deps);
    const actionsPanel = new ActionsPanelComponent({
        history: deps.history,
        getSnapshot: () => deps.snapshot.capture(),
        onUndo: deps.onUndo,
        onRedo: deps.onRedo,
        onResetPath: deps.onResetPath,
        onClearAll: deps.onClearAll,
    });
    actionsPanel.mount(deps.sidebar.actionsContainer);
    return actionsPanel;
}
