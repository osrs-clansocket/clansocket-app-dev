import { AI_BAR_THINK_LABEL_CLASS } from "../../shared/constants/ai-bar-constants.js";

let thinkingEl: HTMLElement | null = null;

export function withThinkingEl<T>(fn: (host: HTMLElement) => T, fallback: T): T {
    return thinkingEl ? fn(thinkingEl) : fallback;
}

export function getThinkLabel(): HTMLSpanElement | null {
    return thinkingEl?.querySelector<HTMLSpanElement>(`.${AI_BAR_THINK_LABEL_CLASS}`) ?? null;
}

export function setThinkingEl(el: HTMLElement | null): void {
    thinkingEl = el;
}
