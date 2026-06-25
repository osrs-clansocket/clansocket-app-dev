import { fetchOptions } from "../value-options-client.js";
import { createFetchStore, type FetchStore } from "../../../stores/lazy-store.js";
import type { ReadSignal } from "../../../../dom/factory/reactive";

type ValueStore = FetchStore & { readonly value$: ReadSignal<readonly string[]> };

export interface ValueOptionsFactory {
    get(triggerType: string, field: string): readonly string[];
    subscribe(listener: () => void): () => void;
}

function valueKey(triggerType: string, field: string): string {
    return `${triggerType}::${field}`;
}

interface FactoryState {
    stores: Map<string, ValueStore>;
    listeners: Set<() => void>;
    fire: () => void;
}

function makeEnsureStore(args: {
    guildId: string;
    state: FactoryState;
}): (triggerType: string, field: string) => ValueStore {
    const { guildId, state } = args;
    return (triggerType, field) => {
        const k = valueKey(triggerType, field);
        const existing = state.stores.get(k);
        if (existing !== undefined) return existing;
        const created = createFetchStore<readonly string[], "value$">({
            key: "value$",
            initial: [],
            load: () => fetchOptions(guildId, triggerType, field),
            subscribe: () => () => undefined,
            onSuccess: state.fire,
        });
        state.stores.set(k, created);
        return created;
    };
}

export function valueOptionsFactory(guildId: string): ValueOptionsFactory {
    const state: FactoryState = {
        stores: new Map<string, ValueStore>(),
        listeners: new Set<() => void>(),
        fire: () => undefined,
    };
    state.fire = (): void => {
        for (const l of state.listeners) l();
    };
    const ensureStore = makeEnsureStore({ guildId, state });
    return {
        get: (triggerType, field) => ensureStore(triggerType, field).value$(),
        subscribe: (listener) => {
            state.listeners.add(listener);
            return () => {
                state.listeners.delete(listener);
            };
        },
    };
}
