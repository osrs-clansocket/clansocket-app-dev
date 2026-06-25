import { button, type Instance } from "../../factory";
import { EST_ROW_PX, type WindowState, type buildWindowRange } from "./history-renderer-window.js";
import type { DisplayItem } from "./history-renderer-types.js";

const INITIAL_WINDOW = 10;
const LOAD_MORE_CLASS = "ai-bar__load-more";

interface WindowStateArgs {
    messages: HTMLElement;
    scroller: HTMLElement;
    initialSlice: DisplayItem[];
    visibleCount: number;
    fullHistory: DisplayItem[];
    topSpacer: ReturnType<typeof buildWindowRange>;
    bottomSpacer: ReturnType<typeof buildWindowRange>;
    loadMoreBtn: ReturnType<typeof button>;
}

function buildWindowState(a: WindowStateArgs): WindowState {
    return {
        history: [...a.initialSlice],
        fullHistory: a.fullHistory,
        visibleCount: a.visibleCount,
        heights: a.initialSlice.map(() => EST_ROW_PX),
        rows: new Map(),
        messages: a.messages,
        scroller: a.scroller,
        topSpacer: a.topSpacer.el,
        bottomSpacer: a.bottomSpacer.el,
        loadMoreBtn: a.loadMoreBtn.el,
        rafPending: false,
    };
}

export function buildLoadBtn(onClick: () => void): ReturnType<typeof button> {
    return button({
        classes: [LOAD_MORE_CLASS],
        text: "Load older messages",
        context: "expand history window to show older messages",
        meta: ["action"],
        onClick,
    });
}

interface AssembleWindowArgs {
    messages: HTMLElement;
    scroller: HTMLElement;
    fullHistory: DisplayItem[];
    topSpacer: Instance;
    bottomSpacer: Instance;
    loadMoreBtn: Instance<HTMLButtonElement>;
    stateRef: { current: WindowState | null };
}

export function assembleRecentWindow(a: AssembleWindowArgs): WindowState {
    const visibleCount = Math.min(INITIAL_WINDOW, a.fullHistory.length);
    const initialSlice = a.fullHistory.slice(-visibleCount);
    const state = buildWindowState({
        initialSlice,
        visibleCount,
        messages: a.messages,
        scroller: a.scroller,
        fullHistory: a.fullHistory,
        topSpacer: a.topSpacer as ReturnType<typeof buildWindowRange>,
        bottomSpacer: a.bottomSpacer as ReturnType<typeof buildWindowRange>,
        loadMoreBtn: a.loadMoreBtn as ReturnType<typeof button>,
    });
    a.stateRef.current = state;
    return state;
}

export function mountWindowParts(
    host: Instance,
    loadMoreBtn: Instance,
    topSpacer: Instance,
    bottomSpacer: Instance,
): void {
    host.addChild(loadMoreBtn);
    host.addChild(topSpacer);
    host.addChild(bottomSpacer);
}
