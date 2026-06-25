import type { HistoryService } from "../services/history-service.js";
import type { PersistenceService } from "../services/persistence-service.js";
import type { SnapshotManager } from "../snapshot-manager.js";

export interface HistCtx {
    snapshot: SnapshotManager;
    history: HistoryService;
    persistence: PersistenceService;
    persistedRestored: () => boolean;
    hostManagedState: () => boolean;
}

export function persistIfAllowed(ctx: HistCtx, snap: ReturnType<SnapshotManager["capture"]>): void {
    if (ctx.persistedRestored() && !ctx.hostManagedState()) ctx.persistence.saveSettings(snap);
}
