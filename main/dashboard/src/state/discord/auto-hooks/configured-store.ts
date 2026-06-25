import { createFetchStore, type FetchStore } from "../../stores/lazy-store.js";
import { listAutoHooks, type AutoHookRow } from "./client.js";
import { listWebhookTokens, type WebhookTokenRow } from "../webhook-tokens/client.js";
import type { ReadSignal } from "../../../dom/factory/reactive";

const NEVER_AUTO_REFRESH = (): (() => void) => () => undefined;

export interface ConfiguredAutoHooks {
    autoHooks: AutoHookRow[];
    tokens: WebhookTokenRow[];
}

export type AutoHooksStore = FetchStore & {
    readonly configured$: ReadSignal<ConfiguredAutoHooks | null>;
};

export function autoHooksStore(guildId: string): AutoHooksStore {
    return createFetchStore<ConfiguredAutoHooks | null, "configured$">({
        key: "configured$",
        initial: null,
        load: async () => {
            const [autoHooks, tokens] = await Promise.all([listAutoHooks(guildId), listWebhookTokens(guildId)]);
            return { autoHooks, tokens };
        },
        subscribe: NEVER_AUTO_REFRESH,
    });
}
