import type { Instance } from "../core";
import type { LiveRow, LiveStore } from "./live-store-types.js";

export { cvAutoClass, type CvAutoHint } from "./live-view-cv.js";
export { wireHoverFreezing } from "./live-view-hover.js";

const KEY_ATTR = "data-live-key";

export interface LiveViewState<Row> {
    mounted: Map<string, Instance>;
    frozen: Set<string>;
    frozenBuffer: Map<string, Row>;
    offChange: (() => void) | null;
    started: boolean;
}

export function freshViewState<Row extends LiveRow>(): LiveViewState<Row> {
    return {
        mounted: new Map(),
        frozen: new Set(),
        frozenBuffer: new Map(),
        offChange: null,
        started: false,
    };
}

export function makeFreezeOps<Row>(
    state: LiveViewState<Row>,
    patchRow: (inst: Instance, row: Row) => void,
): { freeze: (k: string) => void; unfreeze: (k: string) => void } {
    return {
        freeze: (k) => {
            state.frozen.add(k);
        },
        unfreeze: (k) => {
            if (!state.frozen.delete(k)) return;
            const buffered = state.frozenBuffer.get(k);
            const inst = state.mounted.get(k);
            if (buffered !== undefined && inst) patchRow(inst, buffered);
            state.frozenBuffer.delete(k);
        },
    };
}

function makeMountFn<Row>(
    state: LiveViewState<Row>,
    mountRow: (row: Row) => Instance,
    rowCvClass: string | null,
): (k: string, row: Row) => Instance {
    return (k, row) => {
        const inst = mountRow(row);
        inst.el.setAttribute(KEY_ATTR, k);
        if (rowCvClass !== null) inst.el.classList.add(rowCvClass);
        state.mounted.set(k, inst);
        return inst;
    };
}

export function makeRowOps<Row>(
    state: LiveViewState<Row>,
    mountRow: (row: Row) => Instance,
    patchRow: (inst: Instance, row: Row) => void,
    rowCvClass: string | null,
): { mount: (k: string, row: Row) => Instance; patch: (k: string, row: Row) => void; remove: (k: string) => void } {
    const mount = makeMountFn(state, mountRow, rowCvClass);
    const patch = (k: string, row: Row): void => {
        const inst = state.mounted.get(k);
        if (!inst) return;
        if (state.frozen.has(k)) {
            state.frozenBuffer.set(k, row);
            return;
        }
        patchRow(inst, row);
    };
    const remove = (k: string): void => {
        state.mounted.get(k)?.destroy();
        state.mounted.delete(k);
        state.frozen.delete(k);
        state.frozenBuffer.delete(k);
    };
    return { mount, patch, remove };
}

export function reorderMounted<Row>(
    state: LiveViewState<Row>,
    container: Instance,
    store: LiveStore<Row & LiveRow>,
): void {
    const parent = container.el;
    let nextEl: ChildNode | null = parent.firstChild;
    for (const k of store.keys()) {
        const inst = state.mounted.get(k);
        if (!inst) continue;
        if (inst.el === nextEl) nextEl = nextEl?.nextSibling ?? null;
        else parent.insertBefore(inst.el, nextEl);
    }
}
