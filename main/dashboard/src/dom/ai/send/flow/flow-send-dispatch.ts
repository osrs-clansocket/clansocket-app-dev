import { queueSend } from "./engine.js";
import { handleSlashCommand } from "./preflight.js";
import { pushMsg } from "./queue.js";
import { refreshSendButton } from "./send-ui.js";
import type { SendElements, SendState } from "./types.js";

export interface SendDispatchArgs {
    els: SendElements;
    wrappedEls: SendElements;
    state: SendState;
    fireAbort: () => void;
    sendActive: (text: string) => Promise<void>;
}

function handleSlashShortcut(els: SendElements, state: SendState): void {
    els.input.value = "";
    refreshSendButton(els, state);
    els.input.focus();
}

async function dispatchSend(args: SendDispatchArgs, text: string): Promise<void> {
    const { els, wrappedEls, state, sendActive } = args;
    els.input.value = "";
    if (state.inFlight) {
        pushMsg(els, text);
        refreshSendButton(els, state);
        await queueSend(text, wrappedEls);
        return;
    }
    await sendActive(text);
}

export function makeSendDispatch(args: SendDispatchArgs): () => Promise<void> {
    return async (): Promise<void> => {
        const text = args.els.input.value.trim();
        if (!text) {
            if (args.state.inFlight) args.fireAbort();
            return;
        }
        if (handleSlashCommand(text, args.els)) {
            handleSlashShortcut(args.els, args.state);
            return;
        }
        await dispatchSend(args, text);
    };
}
