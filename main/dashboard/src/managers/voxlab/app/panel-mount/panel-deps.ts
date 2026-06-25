import type { FooterPanelComponent } from "../../../../dom/forms/voxlab/panels/footer/footer-panel-component.js";
import type { HistoryService } from "../../services/history-service.js";
import type { LightingManager } from "../../lighting/lighting-manager.js";
import type { PresetStorageService } from "../../services/preset-storage-service.js";
import type { SnapshotManager } from "../../snapshot-manager.js";
import type { TimelineManager } from "../../timeline/timeline-manager.js";

export interface PanelDeps {
    footer: FooterPanelComponent;
    snapshot: SnapshotManager;
    timeline: TimelineManager;
    lighting: LightingManager;
    presetStorage: PresetStorageService;
    onPresetApply: (snap: ReturnType<SnapshotManager["capture"]>) => void;
    onHdrChanged: () => void;
}

export interface MountAllDeps extends PanelDeps {
    history: HistoryService;
    sidebar: { actionsContainer: HTMLElement };
    onUndo: () => void;
    onRedo: () => void;
    onResetPath: (path: string) => void;
    onClearAll: () => void;
}
