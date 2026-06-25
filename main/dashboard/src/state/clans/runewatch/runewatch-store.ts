import { createFetchStore, type FetchStore } from "../../stores/lazy-store.js";
import { boundedRegistry } from "../../stores/bounded-store-registry.js";
import type { ReadSignal } from "../../../dom/factory/reactive";
import { listCases, listFlagged, type FlaggedMember, type RunewatchCase } from "./runewatch-client.js";

export interface RunewatchData {
    cases: RunewatchCase[];
    flagged: FlaggedMember[];
}

const INITIAL: RunewatchData = { cases: [], flagged: [] };
const MAX_CLAN_STORES = 4;

export type RunewatchStore = FetchStore & { readonly data$: ReadSignal<RunewatchData> };

const registry = boundedRegistry<RunewatchStore>(MAX_CLAN_STORES);

function buildRunewatchStore(slug: string): RunewatchStore {
    return createFetchStore<RunewatchData, "data$">({
        key: "data$",
        initial: INITIAL,
        load: async () => {
            const [cases, flagged] = await Promise.all([listCases(slug), listFlagged(slug)]);
            return { cases, flagged };
        },
        subscribe: () => () => {},
    });
}

export function getRunewatchStore(slug: string): RunewatchStore {
    return registry.get(slug, buildRunewatchStore);
}

export function preloadRunewatchStore(slug: string): void {
    getRunewatchStore(slug).ensure();
}

export function clearRunewatchStores(): void {
    registry.clear();
}
