import { clearStored, readStored, writeStored } from "../../../../state/persistence";
import type { SendElements } from "./types.js";

const SUGGESTION_STORAGE_KEY = "ai-suggested-response";

export interface SuggestionApi {
    pendingSuggestion: { v: string | null };
    setSuggestion: (value: string) => void;
    clearSuggestion: () => void;
}

export function buildSuggestionApi(els: SendElements, defaultPlaceholder: string): SuggestionApi {
    const pendingSuggestion: { v: string | null } = { v: readStored<string>(SUGGESTION_STORAGE_KEY) ?? null };
    if (pendingSuggestion.v !== null) els.input.placeholder = pendingSuggestion.v;
    const setSuggestion = (value: string): void => {
        pendingSuggestion.v = value;
        els.input.placeholder = value;
        writeStored(SUGGESTION_STORAGE_KEY, value);
    };
    const clearSuggestion = (): void => {
        if (pendingSuggestion.v === null) return;
        pendingSuggestion.v = null;
        els.input.placeholder = defaultPlaceholder;
        clearStored(SUGGESTION_STORAGE_KEY);
    };
    return { pendingSuggestion, setSuggestion, clearSuggestion };
}
