import type { Instance } from "../../factory";

export interface MemoryListState {
    container: Instance;
    itemState: Map<string, Instance>;
    emptyRef: { v: Instance | null };
    loaderRef: { v: Instance | null };
}

export function clearListRefs(s: MemoryListState): void {
    if (s.emptyRef.v !== null) {
        s.emptyRef.v.destroy();
        s.emptyRef.v = null;
    }
    if (s.loaderRef.v !== null) {
        s.loaderRef.v.destroy();
        s.loaderRef.v = null;
    }
}

export function clearItems(s: MemoryListState): void {
    for (const inst of s.itemState.values()) inst.destroy();
    s.itemState.clear();
}
