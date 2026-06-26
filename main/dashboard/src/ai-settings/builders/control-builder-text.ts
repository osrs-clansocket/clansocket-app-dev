import { derived, type Instance } from "../../dom/factory";
import { input, textarea } from "../../dom/factory/content-ops/form";
import { personaStore, type SlotMeta } from "../../ai/persona-store/index.js";
import { defaultValueOf } from "../../ai/persona-store/defaults-client.js";
import { placeholderForBlock, placeholderForEntry } from "../../ai/persona-store/format/placeholder-formatter.js";

const INPUT_BASE_CLASS = "form__input";
const INPUT_ENTRY_CLASS = "ai-settings__input--entry";
const INPUT_BLOCK_CLASS = "ai-settings__input--block";
const INPUT_NUMBER_CLASS = "ai-settings__input--number";
const BLOCK_ROWS = "5";

export function buildEntryControl(meta: SlotMeta): Instance {
    return input({
        ariaLabel: meta.displayName,
        id: `slot-${meta.key}`,
        type: "text",
        classes: [INPUT_BASE_CLASS, INPUT_ENTRY_CLASS],
        placeholder: derived(() => placeholderForEntry(meta)),
        value: derived(() => personaStore.valueOf(meta.key) ?? ""),
        context: meta.description,
        meta: ["input"],
        onInput: (e) => personaStore.commitOrReset(meta.key, meta.type, (e.target as HTMLInputElement).value),
    });
}

export function buildBlockControl(meta: SlotMeta): Instance {
    return textarea({
        ariaLabel: meta.displayName,
        id: `slot-${meta.key}`,
        classes: [INPUT_BASE_CLASS, INPUT_BLOCK_CLASS],
        placeholder: derived(() => placeholderForBlock(meta)),
        value: derived(() => personaStore.valueOf(meta.key) ?? ""),
        rows: BLOCK_ROWS,
        spellcheck: "true",
        context: meta.description,
        meta: ["input"],
        onInput: (e) => personaStore.commitOrReset(meta.key, meta.type, (e.target as HTMLTextAreaElement).value),
    });
}

export function buildNumberControl(meta: SlotMeta): Instance {
    return input({
        ariaLabel: meta.displayName,
        id: `slot-${meta.key}`,
        type: "number",
        classes: [INPUT_BASE_CLASS, INPUT_NUMBER_CLASS],
        placeholder: derived(() => defaultValueOf(meta.key)),
        value: derived(() => personaStore.valueOf(meta.key) ?? ""),
        min: meta.bounds?.min !== undefined ? String(meta.bounds.min) : undefined,
        max: meta.bounds?.max !== undefined ? String(meta.bounds.max) : undefined,
        inputmode: "numeric",
        context: meta.description,
        meta: ["input"],
        onInput: (e) => personaStore.commitOrReset(meta.key, meta.type, (e.target as HTMLInputElement).value),
    });
}
