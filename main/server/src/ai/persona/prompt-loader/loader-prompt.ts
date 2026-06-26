import { autoPinIds, registerDynamic } from "./dynamic-registry.js";
import { ensureInit, reloadFile, reloadPrompts, startWatcher } from "./registry.js";
import { fillPlaceholders, getOne, readableIndex, resolveByIds, resolveForMode } from "./resolver.js";
import type { DynamicContext, DynamicProvider, PromptFile } from "./types.js";

export const promptLoader = {
    reloadPrompts,
    startWatcher,
    reloadFile,
    autoPinIds,
    fillPlaceholders,

    async init(): Promise<void> {
        ensureInit();
        await import("../../prompts/register.js");
        this.startWatcher();
    },

    registerDynamic(entry: Omit<PromptFile, "content">, provider: DynamicProvider, autoPin = false): void {
        registerDynamic(entry, provider, autoPin);
    },

    get(id: string, ctx: DynamicContext): PromptFile | null {
        return getOne(id, ctx);
    },

    resolve(_instruction: string, modeId: string, ctx: DynamicContext): PromptFile[] {
        return resolveForMode(modeId, ctx);
    },

    resolveByIds(ids: string[], ctx: DynamicContext): PromptFile[] {
        return resolveByIds(ids, ctx);
    },

    readableIndex(_ctx: DynamicContext): { id: string; type: string; preview: string }[] {
        return readableIndex();
    },
};
