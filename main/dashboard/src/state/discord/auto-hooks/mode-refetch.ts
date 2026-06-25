import { autoHooksStore } from "./configured-store.js";
import type { ModeState } from "./mode-feeds.js";
import { loadConfigured } from "./mode-load.js";

export function makeRefetchFn(args: {
    state: ModeState;
    configuredStore: ReturnType<typeof autoHooksStore>;
    render: () => void;
}): () => Promise<void> {
    const { state, configuredStore, render } = args;
    return async (): Promise<void> => {
        const loaded = await loadConfigured(configuredStore);
        state.autoHooks = loaded.autoHooks;
        state.tokens = loaded.tokens;
        render();
    };
}
