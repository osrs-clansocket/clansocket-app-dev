import { createFetchStore, type FetchStore } from "../../stores/lazy-store.js";
import { fetchPluginConfig, type PluginConfigState } from "./client.js";
import type { ReadSignal } from "../../../dom/factory/reactive";

const NEVER_AUTO_REFRESH = (): (() => void) => () => undefined;

export type PluginConfigStore = FetchStore & { readonly config$: ReadSignal<PluginConfigState | null> };

export function pluginConfigStore(slug: string): PluginConfigStore {
    return createFetchStore<PluginConfigState | null, "config$">({
        key: "config$",
        initial: null,
        load: async () => fetchPluginConfig(slug),
        subscribe: NEVER_AUTO_REFRESH,
    });
}
