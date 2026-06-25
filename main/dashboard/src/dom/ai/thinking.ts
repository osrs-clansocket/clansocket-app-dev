import { AI_BAR_THINK_ICON_CLASS, AI_BAR_THINK_LABEL_CLASS } from "../../shared/constants/ai-bar-constants.js";
import { ensureThinkEls } from "./thinking-build.js";
import { spinIn } from "./thinking-spin.js";
import { scrollThinkingVisible } from "./thinking-scroll.js";

export { randomIdlePhrase } from "./thinking-idle.js";
export { setThinkingEl } from "./thinking-host.js";

const SPIN_OUT_MS = 150;

function animateThinking(els: { icon: HTMLImageElement; label: HTMLSpanElement }, text: string): void {
    els.icon.classList.add(`${AI_BAR_THINK_ICON_CLASS}--out`);
    els.label.classList.add(`${AI_BAR_THINK_LABEL_CLASS}--out`);
    setTimeout(() => {
        spinIn(els.icon, els.label, text);
        scrollThinkingVisible();
    }, SPIN_OUT_MS);
}

export function updateThinking(text: string): void {
    const els = ensureThinkEls();
    if (els) animateThinking(els, text);
}
