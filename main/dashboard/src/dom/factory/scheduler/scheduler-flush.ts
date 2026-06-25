import { trustHTML } from "../core/sanitizers/trust-html.js";

const ATTR_STYLE = "style";

export interface FlushQueues {
    measureQueue: Array<() => void>;
    textQueue: Map<HTMLElement, string>;
    htmlQueue: Map<HTMLElement, string>;
    attrQueue: Map<HTMLElement, Map<string, string | null>>;
    animationOps: Array<() => void>;
    deferredOps: Array<() => void>;
}

function flushMeasure(measureQueue: Array<() => void>): void {
    if (measureQueue.length === 0) return;
    const fns = measureQueue.splice(0);
    for (const fn of fns) fn();
}

function flushTextWrites(textQueue: Map<HTMLElement, string>): void {
    for (const [el, value] of textQueue) el.textContent = value;
    textQueue.clear();
}

function flushHtmlWrites(htmlQueue: Map<HTMLElement, string>): void {
    for (const [el, value] of htmlQueue) el.innerHTML = trustHTML(value) as string;
    htmlQueue.clear();
}

function applyAttrWrite(el: HTMLElement, name: string, value: string | null): void {
    if (name === ATTR_STYLE) {
        el.style.cssText = value ?? "";
        return;
    }
    if (value === null) {
        el.removeAttribute(name);
        return;
    }
    el.setAttribute(name, value);
}

function flushAttrWrites(attrQueue: Map<HTMLElement, Map<string, string | null>>): void {
    for (const [el, attrs] of attrQueue) {
        for (const [name, value] of attrs) applyAttrWrite(el, name, value);
    }
    attrQueue.clear();
}

function drainOps(queue: Array<() => void>, deadline: number, clock: () => number): number {
    let i = 0;
    while (i < queue.length && clock() < deadline) {
        queue[i]!();
        i++;
    }
    if (i > 0) queue.splice(0, i);
    return i;
}

export interface FlushOpsArgs {
    queues: FlushQueues;
    budgeted: boolean;
    frameBudgetMs: number;
    clock: () => number;
    onSliced: () => void;
}

export function flushOps(args: FlushOpsArgs): number {
    const { queues, budgeted, frameBudgetMs, clock, onSliced } = args;
    const deadline = budgeted ? clock() + frameBudgetMs : Number.POSITIVE_INFINITY;
    let count = drainOps(queues.animationOps, deadline, clock);
    count += drainOps(queues.deferredOps, deadline, clock);
    if (budgeted && queues.animationOps.length + queues.deferredOps.length > 0) {
        onSliced();
    }
    return count;
}

export function flushWrites(queues: FlushQueues): number {
    const writes = queues.textQueue.size + queues.htmlQueue.size + queues.attrQueue.size;
    flushMeasure(queues.measureQueue);
    flushTextWrites(queues.textQueue);
    flushHtmlWrites(queues.htmlQueue);
    flushAttrWrites(queues.attrQueue);
    return writes;
}
