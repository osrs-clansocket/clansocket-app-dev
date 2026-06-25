import type { AutoHookRow } from "./client.js";
import type { WebhookTokenRow } from "../webhook-tokens/client.js";
import { autoHooksStore } from "./configured-store.js";

export async function loadConfigured(
    store: ReturnType<typeof autoHooksStore>,
): Promise<{ autoHooks: AutoHookRow[]; tokens: WebhookTokenRow[] }> {
    await store.refresh();
    const value = store.configured$();
    return value ?? { autoHooks: [], tokens: [] };
}
