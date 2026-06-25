import { div, type Instance } from "../../factory";
import { addChainEvent } from "../chain-events";
import { addMessage } from "./messaging/messages";
import { getMessagesHost } from "./messaging/messages-host";
import type { DisplayItem } from "./history-renderer-types.js";
import {
    attachScrollHandler,
    buildWindowRange,
    EST_ROW_PX,
    renderWindow,
    setWindowRange,
    sumWindowRange,
    type WindowState,
} from "./history-renderer-window.js";
import { assembleRecentWindow, buildLoadBtn, mountWindowParts } from "./history-renderer-assemble.js";
export type { DisplayItem } from "./history-renderer-types.js";

const PAGE_SIZE = 10;
const ROW_CLASS = "ai-bar__row";
const HISTORY_SELECTOR = ".ai-bar__history";
const MSG_USER = "user" as const;
const MSG_AI = "ai" as const;

function replayHistoryItem(target: HTMLElement, item: DisplayItem): void {
    const events = item.events;
    if (events) {
        for (const e of events) addChainEvent(target, e.type, e.payload);
    }
    if (item.content) {
        addMessage({
            containerEl: target,
            text: item.content,
            type: item.role === MSG_USER ? MSG_USER : MSG_AI,
            raw: item.raw,
            deepLink: item.deepLink,
        });
    }
}

function buildRow(item: DisplayItem): Instance {
    const row = div({ classes: [ROW_CLASS], context: null, meta: null });
    replayHistoryItem(row.el, item);
    return row;
}

function scheduleRender(state: WindowState): void {
    if (state.rafPending) return;
    state.rafPending = true;
    requestAnimationFrame(() => {
        state.rafPending = false;
        renderWindow(state, buildRow);
    });
}

function updateWindowBtn(state: WindowState): void {
    state.loadMoreBtn.hidden = state.visibleCount >= state.fullHistory.length;
}

function expandWindow(state: WindowState): void {
    if (state.visibleCount >= state.fullHistory.length) return;
    const newCount = Math.min(state.visibleCount + PAGE_SIZE, state.fullHistory.length);
    const shift = newCount - state.visibleCount;
    state.visibleCount = newCount;
    const shifted = new Map<number, Instance>();
    for (const [idx, inst] of state.rows) shifted.set(idx + shift, inst);
    state.rows = shifted;
    state.heights = Array.from<number>({ length: shift }).fill(EST_ROW_PX).concat(state.heights);
    const newSlice = state.fullHistory.slice(-newCount);
    state.history.length = 0;
    for (const item of newSlice) state.history.push(item);
    updateWindowBtn(state);
    renderWindow(state, buildRow);
}

function finalizeWindow(args: {
    host: ReturnType<typeof getMessagesHost>;
    state: WindowState;
    loadMoreBtn: ReturnType<typeof buildLoadBtn>;
    topSpacer: ReturnType<typeof buildWindowRange>;
    bottomSpacer: ReturnType<typeof buildWindowRange>;
    scroller: HTMLElement;
}): void {
    const { host, state, loadMoreBtn, topSpacer, bottomSpacer, scroller } = args;
    mountWindowParts(host, loadMoreBtn, topSpacer, bottomSpacer);
    updateWindowBtn(state);
    attachScrollHandler(scroller, () => scheduleRender(state));
    setWindowRange(bottomSpacer.el, sumWindowRange(state, 0, state.history.length));
    renderWindow(state, buildRow);
    scroller.scrollTop = scroller.scrollHeight;
    renderWindow(state, buildRow);
}

function renderRecent(messages: HTMLElement, fullHistory: DisplayItem[]): void {
    const host = getMessagesHost(messages);
    host.clear();
    const scroller = messages.closest<HTMLElement>(HISTORY_SELECTOR) ?? messages;
    const topSpacer = buildWindowRange();
    const bottomSpacer = buildWindowRange();
    const stateRef: { current: WindowState | null } = { current: null };
    const loadMoreBtn = buildLoadBtn(() => {
        if (stateRef.current) expandWindow(stateRef.current);
    });
    const state = assembleRecentWindow({
        messages,
        scroller,
        fullHistory,
        topSpacer,
        bottomSpacer,
        loadMoreBtn,
        stateRef,
    });
    finalizeWindow({ host, state, loadMoreBtn, topSpacer, bottomSpacer, scroller });
}

export { renderRecent };
