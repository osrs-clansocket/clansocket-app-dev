import type { PromptFile } from "../../prompt-loader/index.js";

export function mergeUniqueFiles(target: PromptFile[], extra: PromptFile[], loadedIds: Set<string>): void {
    for (const f of extra) {
        if (!loadedIds.has(f.id)) {
            target.push(f);
            loadedIds.add(f.id);
        }
    }
}
