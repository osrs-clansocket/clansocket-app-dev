import { PART_ORDER } from "../paint/paint-manager-types.js";
import { collectAffectedVertices } from "./history-collect-affected.js";
import type { HistoryState } from "./history-state-types.js";

export function undoStroke(state: HistoryState): Set<number> | null {
    const delta = state.strokeHistory.pop();
    if (delta === undefined) return null;
    for (const [v, [before]] of delta.overrides) {
        if (before === null) state.overridesMap.delete(v);
        else state.overridesMap.set(v, [before[0], before[1], before[2]]);
    }
    for (const part of PART_ORDER) {
        const entry = delta.parts[part];
        if (entry !== undefined) state.partsState[part] = entry[0];
    }
    state.redoStack.push(delta);
    return collectAffectedVertices(delta, state.rangeOf);
}

export function redoStroke(state: HistoryState): Set<number> | null {
    const delta = state.redoStack.pop();
    if (delta === undefined) return null;
    for (const [v, [, after]] of delta.overrides) {
        if (after === null) state.overridesMap.delete(v);
        else state.overridesMap.set(v, [after[0], after[1], after[2]]);
    }
    for (const part of PART_ORDER) {
        const entry = delta.parts[part];
        if (entry !== undefined) state.partsState[part] = entry[1];
    }
    state.strokeHistory.push(delta);
    return collectAffectedVertices(delta, state.rangeOf);
}
