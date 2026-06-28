import { type Instance } from "../../core";

export function positionOverlay(actionsEl: HTMLElement, trigger: HTMLElement, anchor: HTMLElement): void {
    const triggerRect = trigger.getBoundingClientRect();
    const anchorRect = anchor.getBoundingClientRect();
    actionsEl.style.inlineSize = `${triggerRect.width}px`;
    actionsEl.style.blockSize = `${triggerRect.height}px`;
    const overlayWidth = actionsEl.offsetWidth;
    const overlayHeight = actionsEl.offsetHeight;
    const shiftLeft = Math.max(0, overlayWidth - triggerRect.width);
    const shiftUp = Math.max(0, overlayHeight - triggerRect.height);
    actionsEl.style.left = `${triggerRect.left - anchorRect.left - anchor.clientLeft + anchor.scrollLeft - shiftLeft}px`;
    actionsEl.style.top = `${triggerRect.top - anchorRect.top - anchor.clientTop + anchor.scrollTop - shiftUp}px`;
}

export function findAnchor(trigger: HTMLElement): HTMLElement | null {
    let node: HTMLElement | null = trigger.parentElement;
    while (node !== null && node !== document.body) {
        const position = window.getComputedStyle(node).position;
        if (position !== "static") return node;
        node = node.parentElement;
    }
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
