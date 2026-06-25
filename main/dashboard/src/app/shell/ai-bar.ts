import { asideEl, button, BTN_VARIANT_BARE, div, input, span } from "../../dom/factory";
import {
    AI_BAR_CLASS,
    AI_BAR_EXPAND_CLASS,
    AI_BAR_HISTORY_CLASS,
    AI_BAR_INPUT_CLASS,
    AI_BAR_INPUT_ROW_CLASS,
    AI_BAR_MESSAGES_CLASS,
    AI_BAR_RESIZE_CLASS,
    AI_BAR_SEND_CLASS,
    AI_BAR_STATUS_CLASS,
} from "../../shared/constants/ai-bar-constants.js";
import { BS_ICON_CHEVRON_UP_CLASS, BS_ICON_CLASS } from "../../shared/constants/bootstrap-icon-constants.js";

export const SHELL_AI_CLASS = AI_BAR_CLASS;

function makeExpandBtn(): ReturnType<typeof button> {
    return button(
        {
            classes: [AI_BAR_EXPAND_CLASS],
            variant: BTN_VARIANT_BARE,
            ariaLabel: "Toggle chat history",
            title: "Toggle chat history",
            context: "expand or collapse the chat history",
            meta: ["action", "disclosure"],
        },
        [span({ classes: [BS_ICON_CLASS, BS_ICON_CHEVRON_UP_CLASS], context: null, meta: null }).el],
    );
}

function aiBarInput(): ReturnType<typeof input> {
    return input({
        classes: [AI_BAR_INPUT_CLASS],
        ariaLabel: "Ask Varez",
        type: "text",
        placeholder: "Ask Varez...",
        data: { "ai-input": "" },
        context: "type a message to ask Varez",
        meta: ["input"],
    });
}

function makeSendBtn(): ReturnType<typeof button> {
    return button({
        classes: [AI_BAR_SEND_CLASS],
        data: { "ai-send": "" },
        text: "Send",
        context: "send your message to Varez",
        meta: ["submit"],
    });
}

function buildInputRow(): HTMLElement {
    const expandBtn = makeExpandBtn();
    const inputEl = aiBarInput();
    const statusEl = span({ classes: [AI_BAR_STATUS_CLASS], data: { "ai-status": "" }, context: null, meta: null });
    const sendBtn = makeSendBtn();
    return div({ classes: [AI_BAR_INPUT_ROW_CLASS], context: null, meta: null }, [
        expandBtn.el,
        inputEl.el,
        statusEl.el,
        sendBtn.el,
    ]).el;
}

export function buildAiBar(): HTMLElement {
    const messages = div({
        classes: [AI_BAR_MESSAGES_CLASS],
        data: { "ai-messages": "" },
        context: null,
        meta: null,
    });
    const history = div({ classes: [AI_BAR_HISTORY_CLASS], context: null, meta: null }, [messages.el]);
    const resizeHandle = div({
        classes: [AI_BAR_RESIZE_CLASS],
        data: { "ai-resize": "" },
        context: null,
        meta: null,
    });
    return asideEl({ classes: [SHELL_AI_CLASS], context: null, meta: null }, [
        history.el,
        resizeHandle.el,
        buildInputRow(),
    ]).el;
}
