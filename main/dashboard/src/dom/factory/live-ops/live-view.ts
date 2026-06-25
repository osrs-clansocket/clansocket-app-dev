import type { Instance } from "../core";
import { scheduleOp } from "../scheduler/index";
import type { LiveChange, LiveRow, LiveStore } from "./live-store";
import {
    cvAutoClass,
    freshViewState,
    makeFreezeOps,
    makeRowOps,
    reorderMounted,
    wireHoverFreezing,
    type LiveViewState,
} from "./live-view-ops.js";

export type LiveViewMode = "cold" | "streaming" | "catch-up";

export interface LiveViewConfig<Row extends LiveRow> {
    container: Instance;
    store: LiveStore<Row>;
    mountRow: (row: Row) => Instance;
    patchRow: (inst: Instance, row: Row) => void;
    mode?: LiveViewMode;
    rowContentVisibility?: "row" | "card" | "panel";
}

export interface LiveViewHandle {
    start(): void;
    teardown(): void;
    freeze(key: string): void;
    unfreeze(key: string): void;
}

interface ApplyChangeArgs<Row extends LiveRow> {
    state: LiveViewState<Row>;
    container: Instance;
    store: LiveStore<Row>;
    mount: (k: string, row: Row) => Instance;
    patch: (k: string, row: Row) => void;
    remove: (k: string) => void;
}

function makeApplyChange<Row extends LiveRow>(args: ApplyChangeArgs<Row>): (change: LiveChange) => void {
    const { state, container, store, mount, patch, remove } = args;
    return (change) => {
        let orderMaybeChanged = change.removed.size > 0;
        for (const k of change.removed) remove(k);
        for (const k of change.changed) {
            const row = store.get(k);
            if (row === undefined) continue;
            if (state.mounted.has(k)) patch(k, row);
            else {
                mount(k, row).mount(container.el);
                orderMaybeChanged = true;
            }
        }
        if (orderMaybeChanged) reorderMounted(state, container, store);
    };
}

function makeBulkMount<Row extends LiveRow>(
    state: LiveViewState<Row>,
    container: Instance,
    store: LiveStore<Row>,
    mount: (k: string, row: Row) => Instance,
): () => void {
    return () => {
        for (const k of store.keys()) {
            if (state.mounted.has(k)) continue;
            const row = store.get(k);
            if (row !== undefined) mount(k, row).mount(container.el);
        }
        reorderMounted(state, container, store);
    };
}

interface LiveViewWiring<Row extends LiveRow> {
    state: LiveViewState<Row>;
    container: Instance;
    store: LiveStore<Row>;
    hover: { bind: () => void; unbind: () => void };
    applyChange: (change: LiveChange) => void;
    bulkMount: () => void;
    freeze: (key: string) => void;
    unfreeze: (key: string) => void;
}

function makeStartFn<Row extends LiveRow>(w: LiveViewWiring<Row>): () => void {
    return (): void => {
        if (w.state.started) return;
        w.state.started = true;
        w.hover.bind();
        w.state.offChange = w.store.onChange((change) => scheduleOp(() => w.applyChange(change)));
        w.store.start();
        scheduleOp(w.bulkMount);
    };
}

function makeTeardownFn<Row extends LiveRow>(w: LiveViewWiring<Row>): () => void {
    return (): void => {
        w.state.offChange?.();
        w.state.offChange = null;
        w.hover.unbind();
        for (const inst of w.state.mounted.values()) inst.destroy();
        w.state.mounted.clear();
        w.state.frozen.clear();
        w.state.frozenBuffer.clear();
        w.store.teardown();
        w.state.started = false;
    };
}

export function liveView<Row extends LiveRow>(config: LiveViewConfig<Row>): LiveViewHandle {
    const { container, store, mountRow, patchRow } = config;
    const state = freshViewState<Row>();
    const { freeze, unfreeze } = makeFreezeOps(state, patchRow);
    const { mount, patch, remove } = makeRowOps(state, mountRow, patchRow, cvAutoClass(config.rowContentVisibility));
    const hover = wireHoverFreezing(container, { freeze, unfreeze });
    const applyChange = makeApplyChange({ state, container, store, mount, patch, remove });
    const bulkMount = makeBulkMount(state, container, store, mount);
    const wiring: LiveViewWiring<Row> = { state, container, store, hover, applyChange, bulkMount, freeze, unfreeze };
    return {
        start: makeStartFn(wiring),
        teardown: makeTeardownFn(wiring),
        freeze,
        unfreeze,
    };
}
