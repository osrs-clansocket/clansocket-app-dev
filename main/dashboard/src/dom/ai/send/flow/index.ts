import { chainModeStore } from "../chain-mode-store";
import { buildSuggestionApi } from "./flow-suggestion.js";
import { wrapSendEls } from "./flow-wrap-els.js";
import { makeSendActive } from "./flow-send-active.js";
import { makeSendDispatch } from "./flow-send-dispatch.js";
import { wireSendKey } from "./flow-wire-key.js";
import { refreshContinuousBadge, refreshSendButton } from "./send-ui.js";
import type { SendElements, SendState } from "./types.js";

export type { AddMsgFn, SendElements } from "./types.js";

export function wireSend(els: SendElements): void {
    const state: SendState = { inFlight: false, controller: null };
    refreshContinuousBadge(els);
    chainModeStore.onChange(() => refreshContinuousBadge(els));
    const suggestions = buildSuggestionApi(els, els.input.placeholder);
    const wrappedEls = wrapSendEls(els, suggestions.setSuggestion);
    const fireAbort = (): void => {
        if (state.controller) state.controller.abort();
        state.controller = null;
        state.inFlight = false;
        refreshSendButton(els, state);
    };
    const sendActive = makeSendActive({ els, wrappedEls, state });
    const doSend = makeSendDispatch({ els, wrappedEls, state, fireAbort, sendActive });
    els.sendBtn.addEventListener("click", doSend);
    wireSendKey({ els, state, suggestions, doSend });
    els.input.addEventListener("input", () => refreshSendButton(els, state));
}
