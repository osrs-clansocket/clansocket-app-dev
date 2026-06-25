import { type Instance } from "../../../../factory/index.js";

const INITIAL_BATCH = 200;
const SCROLL_BATCH = 200;
const SENTINEL_PX = 200;

export interface LazyRenderHandles {
    debounceHandle: number | null;
    applyFilter(keys: readonly string[]): void;
    dispose(): void;
}

interface LazyRenderState {
    visible: readonly string[];
    rendered: number;
    pendingRaf: number;
    started: boolean;
}

interface LazyOps {
    renderBatch: (count: number) => void;
    scheduleBatch: () => void;
    applyFilter: (keys: readonly string[]) => void;
}

function makeLazyBatch(
    state: LazyRenderState,
    grid: Instance,
    sentinel: Instance,
    buildNode: (key: string) => Instance<HTMLElement>,
): (count: number) => void {
    return (count) => {
        if (state.rendered >= state.visible.length) return;
        const next = Math.min(state.rendered + count, state.visible.length);
        const nodes: Instance<HTMLElement>[] = [];
        for (let i = state.rendered; i < next; i += 1) nodes.push(buildNode(state.visible[i]!));
        grid.addBatchBefore(nodes, sentinel.el);
        state.rendered = next;
        sentinel.el.hidden = state.rendered >= state.visible.length;
    };
}

interface LazyApplyArgs {
    state: LazyRenderState;
    grid: Instance;
    sentinel: Instance;
    loadingMsg: Instance;
    renderBatch: (count: number) => void;
}

function makeLazyFilter(args: LazyApplyArgs): (keys: readonly string[]) => void {
    const { state, grid, sentinel, loadingMsg, renderBatch } = args;
    return (keys) => {
        state.visible = keys;
        state.rendered = 0;
        if (!state.started) {
            loadingMsg.destroy();
            state.started = true;
        }
        grid.setChildren(sentinel);
        renderBatch(INITIAL_BATCH);
    };
}

interface BuildLazyOps {
    state: LazyRenderState;
    grid: Instance;
    sentinel: Instance;
    loadingMsg: Instance;
    buildNode: (key: string) => Instance<HTMLElement>;
}

function buildLazyOps(args: BuildLazyOps): LazyOps {
    const { state, grid, sentinel, loadingMsg, buildNode } = args;
    const renderBatch = makeLazyBatch(state, grid, sentinel, buildNode);
    const scheduleBatch = (): void => {
        if (state.pendingRaf !== 0) return;
        state.pendingRaf = window.requestAnimationFrame(() => {
            state.pendingRaf = 0;
            renderBatch(SCROLL_BATCH);
        });
    };
    const applyFilter = makeLazyFilter({ state, grid, sentinel, loadingMsg, renderBatch });
    return { renderBatch, scheduleBatch, applyFilter };
}

function makeLazyObserver(scheduleBatch: () => void): IntersectionObserver {
    const observer = new IntersectionObserver(
        (records) => {
            for (const r of records)
                if (r.isIntersecting) {
                    scheduleBatch();
                    return;
                }
        },
        { rootMargin: `${SENTINEL_PX}px 0px ${SENTINEL_PX}px 0px` },
    );
    return observer;
}

export function setupLazyRender(
    grid: Instance,
    sentinel: Instance,
    loadingMsg: Instance,
    buildNode: (key: string) => Instance<HTMLElement>,
): LazyRenderHandles {
    const state: LazyRenderState = { visible: [], rendered: 0, pendingRaf: 0, started: false };
    const { scheduleBatch, applyFilter } = buildLazyOps({ state, grid, sentinel, loadingMsg, buildNode });
    const observer = makeLazyObserver(scheduleBatch);
    observer.observe(sentinel.el);
    return {
        applyFilter,
        debounceHandle: null,
        dispose(): void {
            if (state.pendingRaf !== 0) window.cancelAnimationFrame(state.pendingRaf);
            observer.disconnect();
        },
    };
}
