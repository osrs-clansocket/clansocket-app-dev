import { snapshotRegistry, type SnapshotRegistry } from "../../state/voxlab/registries/snapshot-registry.js";
import { SNAPSHOT_SCHEMA_VERSION, type SceneSnapshot } from "../../shared/types/voxlab/snapshot-types.js";

export class SnapshotManager {
    private restoring = false;
    private readonly registry: SnapshotRegistry;

    constructor(registry: SnapshotRegistry = snapshotRegistry) {
        this.registry = registry;
    }

    get isRestoring(): boolean {
        return this.restoring;
    }

    capture(): SceneSnapshot {
        const parts: Record<string, unknown> = {};
        for (const part of this.registry.all()) {
            parts[part.name] = part.getState();
        }
        return {
            schemaVersion: SNAPSHOT_SCHEMA_VERSION,
            capturedAt: Date.now(),
            parts,
        };
    }

    restore(snapshot: SceneSnapshot, opts?: { onlyParts?: ReadonlySet<string> }): void {
        this.restoring = true;
        try {
            for (const part of this.registry.all()) {
                if (opts?.onlyParts && !opts.onlyParts.has(part.name)) {
                    continue;
                }
                const state = snapshot.parts[part.name];
                if (state !== undefined) {
                    part.applyState(state);
                }
            }
        } finally {
            this.restoring = false;
        }
    }
}
