import type { Instance } from "../core";

export interface ReconcileOps<T> {
    container: Instance;
    state: Map<string, Instance>;
    items: ReadonlyArray<T>;
    keyOf: (item: T) => string;
    create: (item: T) => Instance;
    patch?: (inst: Instance, item: T) => void;
}

function dropRemoved(state: Map<string, Instance>, nextKeys: Set<string>): void {
    for (const [key, inst] of state) {
        if (nextKeys.has(key)) continue;
        inst.destroy();
        state.delete(key);
    }
}

export function reconcile<T>(ops: ReconcileOps<T>): void {
    const { container, state, items, keyOf, create, patch } = ops;
    const nextKeys = new Set<string>();
    for (const item of items) nextKeys.add(keyOf(item));
    dropRemoved(state, nextKeys);

    const parent = container.el;
    let cursor: ChildNode | null = parent.firstChild;
    for (const item of items) {
        const key = keyOf(item);
        let inst = state.get(key);
        if (inst === undefined) {
            inst = create(item);
            state.set(key, inst);
            parent.insertBefore(inst.el, cursor);
            continue;
        }
        if (patch !== undefined) patch(inst, item);
        if (cursor === inst.el) {
            cursor = cursor.nextSibling;
        } else {
            parent.insertBefore(inst.el, cursor);
        }
    }
}
