import type { TopicState } from "./projection-types.js";
import { recompute } from "./recomputer-projection.js";
import { registerWriteListener } from "./writes-stream.js";

const states = new Set<TopicState>();
const dirty = new Set<TopicState>();
let flushScheduled = false;

function flushDirty(): void {
    flushScheduled = false;
    const batch = [...dirty];
    dirty.clear();
    for (const state of batch) recompute(state);
}

function markDirty(scopeKey: string, table: string): void {
    let matched = false;
    for (const state of states) {
        for (const t of state.def.triggers) {
            if (t.scopeKey === scopeKey && t.table === table) {
                dirty.add(state);
                matched = true;
                break;
            }
        }
    }
    if (matched && !flushScheduled) {
        flushScheduled = true;
        setImmediate(flushDirty);
    }
}

registerWriteListener((event) => markDirty(event.scopeKey, event.table));

export function addState(state: TopicState): void {
    states.add(state);
}

export function removeState(state: TopicState): void {
    states.delete(state);
    dirty.delete(state);
}
