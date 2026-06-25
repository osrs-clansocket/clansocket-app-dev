import { div, type Instance } from "../../../factory";
import { getMessagesHost } from "../../panel/messaging/messages-host";
import { SEND_KIND_ACTION_FEEDBACK, type SendOptions } from "../../../../ai/client";
import { collectDomState } from "../../../../ai/dom-state";
import type { ActionResult } from "../../../../ai/actions/action-types.js";
import { randomIdlePhrase, setThinkingEl, updateThinking } from "../../thinking";
import { chainModeStore } from "../chain-mode-store";
import { getMode } from "../storage";
import { FOLLOWUP_PLACEHOLDER_TEXT, type SendElements } from "./types.js";
import { AI_BAR_MSG_CLASS, AI_BAR_MSG_THINKING_CLASS } from "../../../../shared/constants/ai-bar-constants.js";

export { handleSlashCommand } from "./slash-command-handler.js";
export { awaitSlashSettle } from "./slash-settle-awaiter.js";

export function showThinking(els: SendElements): Instance {
    const inst = div({ classes: [AI_BAR_MSG_CLASS, AI_BAR_MSG_THINKING_CLASS], context: null, meta: null });
    getMessagesHost(els.messagesEl).addChild(inst);
    setThinkingEl(inst.el);
    updateThinking(randomIdlePhrase());
    return inst;
}

export function buildOptions(text: string): SendOptions {
    const pageState = collectDomState();
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const stamped = `[USER LOCAL TIME: ${new Date().toLocaleString()} (${tz})] ${text}`;
    return { pageState, text: stamped, mode: getMode(), chainMode: chainModeStore.get() };
}

export function buildFollowOptions(results: ActionResult[], priorChainId: string): SendOptions {
    return {
        text: FOLLOWUP_PLACEHOLDER_TEXT,
        mode: getMode(),
        pageState: collectDomState(),
        chainMode: chainModeStore.get(),
        kind: SEND_KIND_ACTION_FEEDBACK,
        actionResults: results,
        priorChainId,
    };
}
