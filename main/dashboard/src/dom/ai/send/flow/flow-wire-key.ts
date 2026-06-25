import { refreshSendButton } from "./send-ui.js";
import type { SendElements, SendState } from "./types.js";
import type { SuggestionApi } from "./flow-suggestion.js";

export function wireSendKey(args: {
    els: SendElements;
    state: SendState;
    suggestions: SuggestionApi;
    doSend: () => Promise<void>;
}): void {
    const { els, state, suggestions, doSend } = args;
    els.input.addEventListener("keydown", (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            doSend();
            return;
        }
        if (e.key === "ArrowRight" && suggestions.pendingSuggestion.v !== null && els.input.value.length === 0) {
            e.preventDefault();
            els.input.value = suggestions.pendingSuggestion.v;
            els.input.setSelectionRange(els.input.value.length, els.input.value.length);
            suggestions.clearSuggestion();
            refreshSendButton(els, state);
        }
    });
}
