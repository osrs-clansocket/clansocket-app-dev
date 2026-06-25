import { queues } from "./scheduler-queues.js";
import { ensureScheduled } from "./scheduler-loop.js";

export function scheduleText(el: HTMLElement, value: string): void {
    queues.textQueue.set(el, value);
    ensureScheduled();
}

export function scheduleHtml(el: HTMLElement, value: string): void {
    queues.htmlQueue.set(el, value);
    ensureScheduled();
}

export function scheduleAttr(el: HTMLElement, name: string, value: string | null): void {
    let bucket = queues.attrQueue.get(el);
    if (!bucket) {
        bucket = new Map();
        queues.attrQueue.set(el, bucket);
    }
    bucket.set(name, value);
    ensureScheduled();
}
