import { type Instance } from "../../core";

export function positionOverlay(actionsEl: HTMLElement, trigger: HTMLElement, anchor: HTMLElement): void {
    const triggerRect = trigger.getBoundingClientRect();
    const anchorRect = anchor.getBoundingClientRect();
    actionsEl.style.left = `${triggerRect.left - anchorRect.left - anchor.clientLeft + anchor.scrollLeft}px`;
    actionsEl.style.top = `${triggerRect.top - anchorRect.top - anchor.clientTop + anchor.scrollTop}px`;
    actionsEl.style.inlineSize = `${triggerRect.width}px`;
    actionsEl.style.blockSize = `${triggerRect.height}px`;
}

export function findAnchor(trigger: HTMLElement): HTMLElement | null {
    const offsetParent = trigger.offsetParent;
    if (offsetParent instanceof HTMLElement) return offsetParent;
    return document.body;
}

export function triggerAnchor(
    host: Instance,
    explicitTrigger?: HTMLElement,
): { trigger: HTMLElement; anchor: HTMLElement } | null {
    const trigger = explicitTrigger ?? host.el.firstElementChild;
    if (!(trigger instanceof HTMLElement)) return null;
    const anchor = findAnchor(trigger);
    if (anchor === null) return null;
    return { trigger, anchor };
}
