import type { PromptFile } from "./types.js";

const _registry: Map<string, PromptFile> = new Map();

export function setPromptFile(id: string, file: PromptFile): void {
    _registry.set(id, file);
}

export function deletePromptFile(id: string): void {
    _registry.delete(id);
}

export function getPromptFile(id: string): PromptFile | undefined {
    return _registry.get(id);
}

export function listPromptFiles(): IterableIterator<PromptFile> {
    return _registry.values();
}
