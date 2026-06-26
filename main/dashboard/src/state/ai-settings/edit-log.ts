import { type ReadSignal } from "../../dom/factory/reactive/index.js";
import { persistedSignal } from "../persistence/index.js";

const RING_CAPACITY = 16;
const STORAGE_KEY = "ai-settings.edit-log";

export type EditKind = "slot" | "mode";

export interface EditEntry {
    kind: EditKind;
    key: string;
    from: string | undefined;
    to: string | undefined;
    ts: number;
}

const _entries = persistedSignal<readonly EditEntry[]>(STORAGE_KEY, []);

export const recentEdits$: ReadSignal<readonly EditEntry[]> = _entries;

export function recordEdit(entry: EditEntry): void {
    const next = [entry, ..._entries()];
    if (next.length > RING_CAPACITY) next.length = RING_CAPACITY;
    _entries.set(Object.freeze(next));
}

export function clearEdits(): void {
    _entries.set(Object.freeze([]));
}
