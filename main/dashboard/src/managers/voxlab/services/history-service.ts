import { snapshotRegistry } from "../../../state/voxlab/registries/snapshot-registry.js";
import { readByPath } from "../../../voxlab/timeline/property-paths.js";
import type { SceneSnapshot } from "../../../shared/types/voxlab/snapshot-types.js";
import { cloneSnapshot, historyValuesEqual, type HistoryChange, type HistoryEntry } from "./history-types.js";
export type { HistoryChange, HistoryEntry } from "./history-types.js";

const MAX_PER_PATH_ENTRIES = 10;

export class HistoryService extends EventTarget {
    private baseline: SceneSnapshot | null = null;
    private previousSnapshot: SceneSnapshot | null = null;
    private log: HistoryEntry[] = [];
    private redoStack: HistoryEntry[] = [];
    private suspended = false;

    initialize(baseline: SceneSnapshot): void {
        this.baseline = cloneSnapshot(baseline);
        this.previousSnapshot = cloneSnapshot(baseline);
        this.log = [];
        this.redoStack = [];
        this.emit();
    }

    syncPrevious(snapshot: SceneSnapshot): void {
        this.previousSnapshot = cloneSnapshot(snapshot);
    }

    record(snapshot: SceneSnapshot): void {
        if (this.suspended || !this.previousSnapshot) {
            return;
        }
        const diffs: HistoryEntry[] = [];
        for (const path of snapshotRegistry.allPathStrings()) {
            const prev = readByPath(this.previousSnapshot, path);
            const next = readByPath(snapshot, path);
            if (!historyValuesEqual(prev, next)) {
                diffs.push({ path, prevValue: prev, nextValue: next, timestamp: Date.now() });
            }
        }
        if (diffs.length === 0) {
            return;
        }
        for (const d of diffs) {
            this.log.push(d);
        }
        this.redoStack = [];
        this.trimPerPath();
        this.previousSnapshot = cloneSnapshot(snapshot);
        this.emit();
    }

    suspend(): void {
        this.suspended = true;
    }

    resume(): void {
        this.suspended = false;
    }

    canUndo(): boolean {
        return this.log.length > 0;
    }

    canRedo(): boolean {
        return this.redoStack.length > 0;
    }

    peekUndo(): HistoryEntry | null {
        return this.log.length > 0 ? this.log[this.log.length - 1] : null;
    }

    peekRedo(): HistoryEntry | null {
        return this.redoStack.length > 0 ? this.redoStack[this.redoStack.length - 1] : null;
    }

    popUndo(): HistoryEntry | null {
        const entry = this.log.pop();
        if (!entry) {
            return null;
        }
        this.redoStack.push(entry);
        this.emit();
        return entry;
    }

    popRedo(): HistoryEntry | null {
        const entry = this.redoStack.pop();
        if (!entry) {
            return null;
        }
        this.log.push(entry);
        this.emit();
        return entry;
    }

    resetPathEntries(path: string): void {
        this.log = this.log.filter((e) => e.path !== path);
        this.redoStack = this.redoStack.filter((e) => e.path !== path);
        this.emit();
    }

    clearAll(): void {
        this.log = [];
        this.redoStack = [];
        this.emit();
    }

    getBaseline(): SceneSnapshot | null {
        return this.baseline;
    }

    getHistoryChanges(current: SceneSnapshot): HistoryChange[] {
        if (!this.baseline) {
            return [];
        }
        const out: HistoryChange[] = [];
        for (const path of snapshotRegistry.allPathStrings()) {
            const defaultValue = readByPath(this.baseline, path);
            const currentValue = readByPath(current, path);
            if (!historyValuesEqual(defaultValue, currentValue)) {
                out.push({ path, currentValue, defaultValue });
            }
        }
        return out;
    }

    private trimPerPath(): void {
        const counts = new Map<string, number>();
        for (let i = this.log.length - 1; i >= 0; i--) {
            const entry = this.log[i];
            const count = (counts.get(entry.path) ?? 0) + 1;
            counts.set(entry.path, count);
            if (count > MAX_PER_PATH_ENTRIES) {
                this.log.splice(i, 1);
            }
        }
    }

    private emit(): void {
        this.dispatchEvent(new CustomEvent("history-change"));
    }
}
