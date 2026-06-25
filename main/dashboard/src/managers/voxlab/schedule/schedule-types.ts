import type { HistoryService } from "../services/history-service.js";
import type { KeyframeRecorderService } from "../services/keyframe-recorder-service.js";
import type { PersistenceService } from "../services/persistence-service.js";
import type { SnapshotManager } from "../snapshot-manager.js";

export interface ScheduleState {
    recorderRafPending: boolean;
    cameraMoveRafPending: boolean;
    settingsSaveTimer: number | null;
}

export interface ScheduleDeps {
    state: ScheduleState;
    snapshot: SnapshotManager;
    persistence: PersistenceService;
    history: HistoryService;
    recorder: KeyframeRecorderService;
    persistedRestored: () => boolean;
    hostManagedState: () => boolean;
    onCameraMoved: () => void;
}
