import { personaDefaults } from "../default-persona/index.js";
import { promptLoader, type PromptFile } from "../prompt-loader/index.js";
import { formatMetaIndex } from "./format-state.js";
import { applyOverrides, applyPersonalityBlanks } from "./prompt-overrides.js";

export function buildPlaceholderData(
    pageState: Record<string, unknown> | null,
    personaOverrides: Record<string, string>,
    modeOverrides: Record<string, boolean>,
): Record<string, string> {
    const nowMs = Date.now();
    return {
        __meta_index__: pageState
            ? formatMetaIndex(pageState)
            : 'No page state available. Emit read: ["page-state"] first.',
        __now_utc_ms__: String(nowMs),
        __now_iso__: new Date(nowMs).toISOString(),
        ...personaDefaults,
        ...applyOverrides(personaOverrides),
        ...applyPersonalityBlanks(modeOverrides),
    };
}

export function fillPromptSections(files: PromptFile[], placeholderData: Record<string, string>): string[] {
    const sections: string[] = [];
    for (const file of files) {
        const filled = promptLoader.fillPlaceholders(file.content, placeholderData);
        sections.push(`[PROMPT: ${file.id}]\n${filled}`);
    }
    return sections;
}
