import { aiClient } from "../../../../ai/client";
import { setThinkingEl } from "../../thinking";
import { showAuthGate } from "../../panel/auth/gate";
import { buildOptions, showThinking } from "./preflight.js";
import type { SendElements } from "./types.js";
import { isAuthError, isChainAbort } from "./engine-errors.js";
import { runChainTurn } from "./engine-chain-turn.js";

export async function executeSend(text: string, els: SendElements, signal: AbortSignal): Promise<void> {
    try {
        await runChainTurn({ els, signal, options: buildOptions(text), displayText: text, depth: 0 });
    } catch (err) {
        if (isChainAbort(err)) return;
        const msg = err instanceof Error ? err.message : String(err);
        if (isAuthError(msg)) {
            showAuthGate(els.messagesEl, () => runRetrySend(text, els));
            return;
        }
        els.addMsg({ containerEl: els.messagesEl, text: msg, type: "error" });
    }
}

export async function queueSend(text: string, els: SendElements): Promise<void> {
    try {
        await aiClient.send(buildOptions(text));
    } catch (err) {
        if (isChainAbort(err)) return;
        els.addMsg({
            containerEl: els.messagesEl,
            text: err instanceof Error ? err.message : String(err),
            type: "error",
        });
    }
}

async function runRetrySend(text: string, els: SendElements): Promise<void> {
    const controller = new AbortController();
    const thinking = showThinking(els);
    await executeSend(text, els, controller.signal);
    thinking.destroy();
    setThinkingEl(null);
}
