import { setThinkingEl } from "../../thinking";
import { ROLE_USER } from "../storage";
import { executeSend } from "./engine.js";
import { showThinking } from "./preflight.js";
import { refreshSendButton } from "./send-ui.js";
import type { SendElements, SendState } from "./types.js";

export function makeSendActive(args: {
    els: SendElements;
    wrappedEls: SendElements;
    state: SendState;
}): (text: string) => Promise<void> {
    const { els, wrappedEls, state } = args;
    return async (text: string): Promise<void> => {
        els.addMsg({ text, containerEl: els.messagesEl, type: ROLE_USER });
        state.controller?.abort();
        state.controller = new AbortController();
        state.inFlight = true;
        refreshSendButton(els, state);
        const thinking = showThinking(els);
        await executeSend(text, wrappedEls, state.controller.signal);
        thinking.destroy();
        setThinkingEl(null);
        state.controller = null;
        state.inFlight = false;
        refreshSendButton(els, state);
        els.input.focus();
    };
}
