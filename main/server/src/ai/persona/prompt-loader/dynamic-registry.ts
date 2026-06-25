import { setPromptFile } from "./registry.js";
import type { DynamicProvider, PromptFile } from "./types.js";

const dynamicProviders = new Map<string, DynamicProvider>();
const pinSet = new Set<string>();

export function registerDynamic(entry: Omit<PromptFile, "content">, provider: DynamicProvider, autoPin: boolean): void {
    dynamicProviders.set(entry.id, provider);
    if (autoPin) pinSet.add(entry.id);
    setPromptFile(entry.id, { ...entry, content: "" } as PromptFile);
}

export function autoPinIds(): string[] {
    return Array.from(pinSet);
}

export function hasDynamic(id: string): boolean {
    return dynamicProviders.has(id);
}

export function callDynamic(id: string, ctx: Parameters<DynamicProvider>[0]): string {
    return dynamicProviders.get(id)!(ctx);
}
