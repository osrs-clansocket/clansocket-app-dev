import {
    applyEffects,
    code,
    details,
    div,
    onceEffect,
    pre,
    summary,
    type Instance,
    baseProps,
    textProps,
} from "../../../factory";
import { getMessagesHost } from "./messages-host";
import { renderMarkdown, highlightCode, stripCodeFences } from "../../../../ai/markdown";
import { shouldAutoExpand } from "../layout/bar-height.js";
import { scrollBottom } from "../layout/scroll-to-bottom.js";
import {
    AI_BAR_CLASS,
    AI_BAR_EXPANDED_CLASS,
    AI_BAR_HISTORY_CLASS,
    AI_BAR_MSG_CLASS,
    AI_BAR_MSG_CONTENT_CLASS,
    AI_BAR_RAW_CLASS,
    AI_BAR_RAW_PRE_CLASS,
    AI_BAR_RAW_SUMMARY_CLASS,
    PRISM_BLOCK_CLASS,
} from "../../../../shared/constants/ai-bar-constants.js";
import { SYNTAX_LANGUAGE_JSON_CLASS } from "../../../../shared/constants/syntax-highlight-constants.js";

const SCROLL_DELAY_MS = 350;
const SCROLL_PAD_PX = 8;

type MessageType = "user" | "ai" | "error" | "status";
const MSG_AI: MessageType = "ai";

function buildRawCode(raw: string): Instance {
    const node = code(baseProps([SYNTAX_LANGUAGE_JSON_CLASS]));
    try {
        const pretty = JSON.stringify(JSON.parse(stripCodeFences(raw)), null, 2);
        node.setHTML(highlightCode(pretty, "json"));
    } catch {
        node.setText(stripCodeFences(raw));
    }
    return node;
}

function scrollIntoView(msg: Instance, det: HTMLDetailsElement): void {
    if (!det.open) return;
    const scrollParent = msg.el.closest<HTMLElement>(`.${AI_BAR_HISTORY_CLASS}`);
    if (!scrollParent) return;
    const overflow = det.getBoundingClientRect().bottom - scrollParent.getBoundingClientRect().bottom;
    if (overflow > 0) scrollParent.scrollTop += overflow + SCROLL_PAD_PX;
}

function addRawDetails(msg: Instance, raw: string): void {
    const det = details(baseProps([AI_BAR_RAW_CLASS], "expand the raw AI response", ["disclosure"]), [
        summary(textProps([AI_BAR_RAW_SUMMARY_CLASS], "Raw response")),
        pre(
            {
                classes: [SYNTAX_LANGUAGE_JSON_CLASS, AI_BAR_RAW_PRE_CLASS, PRISM_BLOCK_CLASS],
                context: null,
                meta: null,
            },
            [buildRawCode(raw)],
        ),
    ]) as Instance<HTMLDetailsElement>;
    det.el.addEventListener("toggle", () => {
        scrollIntoView(msg, det.el);
        if (det.el.open) {
            const body = det.el.querySelector<HTMLElement>(":scope > pre");
            if (body) applyEffects(body, { name: "fade-in", once: true });
        }
    });
    msg.addChild(det);
}

const PROSE_TAG_TO_CLASS: Record<string, string> = {
    P: "ai-prose__p",
    STRONG: "ai-prose__strong",
    EM: "ai-prose__em",
    UL: "ai-prose__ul",
    OL: "ai-prose__ol",
    LI: "ai-prose__li",
    CODE: "ai-prose__code",
    PRE: "ai-prose__pre",
};
function classifyProse(root: HTMLElement): void {
    for (const el of root.querySelectorAll<HTMLElement>("p, strong, em, ul, ol, li, code, pre")) {
        const cls = PROSE_TAG_TO_CLASS[el.tagName];
        if (cls !== undefined) el.classList.add(cls);
    }
    for (const pre of root.querySelectorAll<HTMLElement>('pre[class*="language-"]')) {
        pre.classList.add("prism-block");
    }
    for (const code of root.querySelectorAll<HTMLElement>('code[class*="language-"]')) {
        if (code.parentElement && code.parentElement.tagName !== "PRE") {
            code.classList.add("prism-inline");
        }
    }
}

function addAiMessage(msg: Instance, text: string, raw?: string, deepLink?: string): void {
    const content = div(baseProps([AI_BAR_MSG_CONTENT_CLASS])).setHTML(renderMarkdown(text, deepLink ?? null));
    classifyProse(content.el);
    msg.addChild(content);
    if (raw && raw !== text) addRawDetails(msg, raw);
}

function ensureExpanded(container: HTMLElement): void {
    const bar = container.closest(`.${AI_BAR_CLASS}`);
    if (bar && !bar.classList.contains(AI_BAR_EXPANDED_CLASS) && shouldAutoExpand()) {
        bar.classList.add(AI_BAR_EXPANDED_CLASS);
    }
    const scrollParent = (container.closest<HTMLElement>(`.${AI_BAR_HISTORY_CLASS}`) ?? container) as HTMLElement;
    scrollBottom(scrollParent);
    setTimeout(() => scrollBottom(scrollParent), SCROLL_DELAY_MS);
}

interface AddMessageOpts {
    containerEl: HTMLElement;
    text: string;
    type: MessageType;
    raw?: string;
    deepLink?: string;
}

function addMessage({ containerEl, text, type, raw, deepLink }: AddMessageOpts): HTMLElement {
    const msg = div({
        classes: [AI_BAR_MSG_CLASS, `${AI_BAR_MSG_CLASS}--${type}`],
        effects: onceEffect("rise"),
        context: null,
        meta: null,
    });
    if (type === MSG_AI) addAiMessage(msg, text, raw, deepLink);
    else msg.setText(text);
    getMessagesHost(containerEl).addChild(msg);
    ensureExpanded(containerEl);
    return msg.el;
}

export { addMessage };
export type { MessageType };
