import { div, baseProps } from "../../factory";
import type { MemoryFile } from "../../../ai/memory-client";
import { clearItems, clearListRefs, type MemoryListState } from "./list-state.js";
import { renderFiles, renderLoading } from "./list-renders.js";

export interface MemoryListHandle {
    readonly el: HTMLElement;
    renderFiles(files: MemoryFile[]): void;
    renderLoading(): void;
    destroyAll(): void;
}

function destroyMemoryList(s: MemoryListState): void {
    clearListRefs(s);
    clearItems(s);
}

export function createMemoryList(): MemoryListHandle {
    const state: MemoryListState = {
        container: div(baseProps([])),
        itemState: new Map(),
        emptyRef: { v: null },
        loaderRef: { v: null },
    };
    return {
        el: state.container.el,
        renderFiles: (files) => renderFiles(state, files),
        renderLoading: () => renderLoading(state),
        destroyAll: () => destroyMemoryList(state),
    };
}
