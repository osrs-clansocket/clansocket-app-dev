import { div } from "../../factory";
import { reconcile } from "../../factory/live-ops/reconcile.js";
import type { MemoryFile } from "../../../ai/memory-client";
import { AI_MEMORY_EMPTY_CLASS } from "../../../shared/constants/ai-memory-constants.js";
import { buildListItem } from "./list-item.js";
import { buildLoader } from "./list-loader.js";
import { clearItems, clearListRefs, type MemoryListState } from "./list-state.js";

function renderEmpty(s: MemoryListState): void {
    clearItems(s);
    s.emptyRef.v = div({
        classes: [AI_MEMORY_EMPTY_CLASS],
        text: "No memory files yet.",
        context: null,
        meta: null,
    });
    s.container.addChild(s.emptyRef.v);
}

export function renderFiles(s: MemoryListState, files: MemoryFile[]): void {
    clearListRefs(s);
    if (files.length === 0) {
        renderEmpty(s);
        return;
    }
    const sorted = [...files].sort((a, b) => a.id.localeCompare(b.id));
    reconcile<MemoryFile>({
        container: s.container,
        state: s.itemState,
        items: sorted,
        keyOf: (f) => f.id,
        create: (f) => buildListItem(f),
    });
}

export function renderLoading(s: MemoryListState): void {
    clearListRefs(s);
    clearItems(s);
    s.loaderRef.v = buildLoader();
    s.container.addChild(s.loaderRef.v);
}
