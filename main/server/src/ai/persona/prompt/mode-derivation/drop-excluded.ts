import type { PromptFile } from "../../prompt-loader/index.js";
import { excludedIds } from "./extractor-excluded-ids.js";

export function dropExcluded(
    files: PromptFile[],
    loadedIds: Set<string>,
    modeOverrides: Record<string, boolean>,
): void {
    const excluded = excludedIds(modeOverrides);
    if (excluded.size === 0) return;
    const filtered = files.filter((f) => !excluded.has(f.id));
    for (const id of excluded) loadedIds.delete(id);
    files.length = 0;
    files.push(...filtered);
}
