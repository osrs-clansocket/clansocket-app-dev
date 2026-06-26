import { createFetchStore, type FetchStore } from "../../stores/lazy-store.js";
import { boundedRegistry } from "../../stores/bounded-store-registry.js";
import type { ReadSignal } from "../../../dom/factory/reactive";
import {
    getCooldown,
    listCases,
    listFlagged,
    type FlaggedMember,
    type RunewatchCase,
    type RunewatchCooldownState,
} from "./runewatch-client.js";

export interface RunewatchData {
    cases: RunewatchCase[];
    flagged: FlaggedMember[];
    cooldown: RunewatchCooldownState | null;
}

export function buildRunewatchData(
    cases: RunewatchCase[],
    flagged: FlaggedMember[],
    cooldown: RunewatchCooldownState | null,
): RunewatchData {
    return { cases, flagged, cooldown };
}

const INITIAL: RunewatchData = buildRunewatchData([], [], null);
const MAX_CLAN_STORES = 4;

export type RunewatchStore = FetchStore & { readonly data$: ReadSignal<RunewatchData> };

const registry = boundedRegistry<RunewatchStore>(MAX_CLAN_STORES);

function buildRunewatchStore(slug: string): RunewatchStore {
    return createFetchStore<RunewatchData, "data$">({
        key: "data$",
        initial: INITIAL,
        load: async () => {
            const [cases, flagged, cooldown] = await Promise.all([
                listCases(slug),
                listFlagged(slug),
                getCooldown(slug).catch(() => null),
            ]);
            return buildRunewatchData(cases, flagged, cooldown);
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
