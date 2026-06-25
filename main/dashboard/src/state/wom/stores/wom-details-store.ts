import { getGroupDetails, type WomGroupDetails } from "../clients/wom-client.js";
import { createFetchStore, type FetchStore } from "../../stores/lazy-store.js";
import type { ReadSignal } from "../../../dom/factory/reactive";

type WomDetailsStore = FetchStore & { readonly details$: ReadSignal<WomGroupDetails | null> };

export function womDetailsStore(slug: string, isLinked: () => boolean): WomDetailsStore {
    return createFetchStore<WomGroupDetails | null, "details$">({
        key: "details$",
        initial: null,
        load: async () => {
            if (!isLinked()) return null;
            return getGroupDetails(slug);
        },
        subscribe: () => () => undefined,
    });
}
