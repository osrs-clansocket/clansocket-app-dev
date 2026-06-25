import { div, type Instance } from "../../factory";
import { getMessagesHost } from "./messaging/messages-host";
import { setDynProp } from "../../../state/dynamic-styles.js";
import type { DisplayItem } from "./history-renderer-types.js";

const OVERSCAN_PX = 800;
export const EST_ROW_PX = 72;
const SPACER_CLASS = "ai-bar__spacer";

export interface WindowState {
    history: DisplayItem[];
    fullHistory: DisplayItem[];
    visibleCount: number;
    heights: number[];
    rows: Map<number, Instance>;
    messages: HTMLElement;
    scroller: HTMLElement;
    topSpacer: HTMLElement;
    bottomSpacer: HTMLElement;
    loadMoreBtn: HTMLElement;
    rafPending: boolean;
}

export function buildWindowRange(): Instance {
    return div({ classes: [SPACER_CLASS], context: null, meta: null });
}

export function sumWindowRange(state: WindowState, from: number, to: number): number {
    let total = 0;
    for (let i = from; i < to; i++) total += state.heights[i] ?? EST_ROW_PX;
    return total;
}

function computeRange(state: WindowState): { start: number; end: number } {
    const top = state.scroller.scrollTop - OVERSCAN_PX;
    const bottom = state.scroller.scrollTop + state.scroller.clientHeight + OVERSCAN_PX;
    const len = state.history.length;
    let acc = 0;
    let start = 0;
    while (start < len && acc + (state.heights[start] ?? EST_ROW_PX) < top) {
        acc += state.heights[start] ?? EST_ROW_PX;
        start++;
    }
    let end = start;
    let visible = acc;
    while (end < len && visible < bottom) {
        visible += state.heights[end] ?? EST_ROW_PX;
        end++;
    }
    return { start, end };
}

export function setWindowRange(el: HTMLElement, px: number): void {
    setDynProp(el, "block-size", `${Math.max(0, Math.round(px))}px`);
}

function nextRowRef(state: WindowState, i: number, end: number): Node {
    for (let j = i + 1; j < end; j++) {
        const existing = state.rows.get(j);
        if (existing) return existing.el;
    }
    return state.bottomSpacer;
}

function pruneWindow(state: WindowState, start: number, end: number): void {
    for (const [idx, inst] of state.rows) {
        if (idx < start || idx >= end) {
            inst.destroy();
            state.rows.delete(idx);
        }
    }
}

function measureWindow(state: WindowState, start: number, end: number): void {
    for (let i = start; i < end; i++) {
        const inst = state.rows.get(i);
        if (!inst) continue;
        const h = inst.el.offsetHeight;
        if (h > 0 && h !== state.heights[i]) state.heights[i] = h;
    }
}

export function renderWindow(state: WindowState, buildRow: (item: DisplayItem) => Instance): void {
    const { start, end } = computeRange(state);
    pruneWindow(state, start, end);
    const host = getMessagesHost(state.messages);
    for (let i = start; i < end; i++) {
        if (state.rows.has(i)) continue;
        const row = buildRow(state.history[i]!);
        host.addBefore(row, nextRowRef(state, i, end));
        state.rows.set(i, row);
    }
    const beforeTop = sumWindowRange(state, 0, start);
    setWindowRange(state.topSpacer, beforeTop);
    setWindowRange(state.bottomSpacer, sumWindowRange(state, end, state.history.length));
    measureWindow(state, start, end);
    const correctedTop = sumWindowRange(state, 0, start);
    if (correctedTop !== beforeTop) setWindowRange(state.topSpacer, correctedTop);
}

const scrollHandlers = new WeakMap<HTMLElement, EventListener>();

export function attachScrollHandler(scroller: HTMLElement, onScroll: () => void): void {
    const prev = scrollHandlers.get(scroller);
    if (prev) scroller.removeEventListener("scroll", prev);
    const handler: EventListener = () => onScroll();
    scroller.addEventListener("scroll", handler, { passive: true });
    scrollHandlers.set(scroller, handler);
}
