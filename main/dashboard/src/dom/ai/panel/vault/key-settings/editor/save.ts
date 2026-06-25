import { putEntry, removeEntry, setPriority } from "../../../../../../ai/vault/vault/index.js";
import { AppEvents, events } from "../../../../../../managers/events.js";
import { getActiveKey } from "../../../../../../ai/vault/session.js";
import { providerLabel } from "../../../known-providers.js";
import { describeError } from "../error-formatter.js";
import { CUSTOM_PROVIDER, type KeySettingsOpts, type UnlockedSub } from "../constants.js";

export interface SaveContext {
    isEdit: boolean;
    editingProvider: string | null;
    usedProviders: Set<string>;
    providerHidden: HTMLInputElement;
    customInput: { el: HTMLInputElement };
    keyInput: { el: HTMLInputElement };
    tokensSlider: { el: HTMLInputElement };
    priorityHidden: HTMLInputElement;
    getModelValue: () => string;
    showError: (msg: string) => void;
    setSub: (next: UnlockedSub) => void;
    rerender: () => Promise<void>;
    opts: KeySettingsOpts;
}

function resolveProvider(ctx: SaveContext): string | null {
    let provider = ctx.providerHidden.value;
    if (provider === CUSTOM_PROVIDER) {
        provider = ctx.customInput.el.value.trim().toLowerCase();
        if (!provider) {
            ctx.showError("Custom provider name required");
            return null;
        }
    }
    if (!ctx.isEdit && ctx.usedProviders.has(provider)) {
        ctx.showError(`A key for "${providerLabel(provider)}" already exists. Edit it instead.`);
        return null;
    }
    return provider;
}

async function persistSave(args: {
    ctx: SaveContext;
    derived: NonNullable<ReturnType<typeof getActiveKey>>;
    provider: string;
    apiKey: string;
    maxTokens: number;
    newPriority: number;
    model: string | undefined;
}): Promise<void> {
    const { ctx, derived, provider, apiKey, maxTokens, newPriority, model } = args;
    if (ctx.isEdit && ctx.editingProvider !== null && ctx.editingProvider !== provider) {
        await removeEntry(ctx.editingProvider);
    }
    await putEntry(derived, provider, { apiKey, maxTokens, model });
    await setPriority(provider, newPriority);
    events.emit(AppEvents.AI_VAULT_CHANGED);
    ctx.setSub({ mode: "list" });
    await ctx.rerender();
    ctx.opts.onChange?.();
}

export async function handleSave(ctx: SaveContext): Promise<void> {
    const derived = getActiveKey();
    if (!derived) {
        ctx.showError("Vault is locked");
        return;
    }
    const provider = resolveProvider(ctx);
    if (provider === null) return;
    const apiKey = ctx.keyInput.el.value.trim();
    if (!apiKey) {
        ctx.showError("API key required");
        return;
    }
    const maxTokens = Number(ctx.tokensSlider.el.value);
    const newPriority = Number(ctx.priorityHidden.value);
    const model = ctx.getModelValue() || undefined;
    try {
        await persistSave({ ctx, derived, provider, apiKey, maxTokens, newPriority, model });
    } catch (err) {
        ctx.showError(describeError(err));
    }
}
