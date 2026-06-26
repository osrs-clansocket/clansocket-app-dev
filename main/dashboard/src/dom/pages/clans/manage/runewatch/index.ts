import "../../../../../styles/pages/clans/manage/runewatch/clan-runewatch-page.css";
import { div, baseProps } from "../../../../factory";
import { effect } from "../../../../factory/reactive/index.js";
import { events } from "../../../../../managers/events";
import { buildRunewatchData, getRunewatchStore } from "../../../../../state/clans/runewatch/runewatch-store.js";
import type { Instance } from "../../../../factory";
import { brandHead, buildBottomPane, buildTopPane } from "./index-panes.js";
import { makeBottomRenderer, type RunewatchState } from "./index-bottom-renderer.js";
import { makeTopRenderer } from "./index-top-renderer.js";
import { makeSentinelObserver } from "./index-sentinel-observer.js";
import { makeRefreshFn, wireCooldown } from "./index-refresh.js";

const HOST_CLASS = "clans-manage__runewatch";
const SHELL_CLASS = "clans-manage-shell";

interface RunewatchWiring {
    state: RunewatchState;
    top: ReturnType<typeof buildTopPane>;
    bottom: ReturnType<typeof buildBottomPane>;
    renderTop: () => void;
    renderBottom: () => void;
    appendMoreCases: () => void;
    refreshRef: { fn: () => Promise<void> };
}

function buildRunewatchWiring(): RunewatchWiring {
    const state: RunewatchState = {
        dataRef: buildRunewatchData([], [], null),
        queryRef: { value: "" },
        pendingCases: [],
        renderedCount: 0,
    };
    const refreshRef: { fn: () => Promise<void> } = { fn: async () => undefined };
    const top = buildTopPane(() => void refreshRef.fn());
    const renderBottomRef: { fn: () => void } = { fn: () => undefined };
    const bottom = buildBottomPane((q) => {
        state.queryRef.value = q;
        renderBottomRef.fn();
    });
    const { renderBottom, appendMoreCases } = makeBottomRenderer(state, bottom);
    renderBottomRef.fn = renderBottom;
    const flaggedPool = new Map<string, Instance<HTMLElement>>();
    const renderTop = makeTopRenderer({ state, top, flaggedPool });
    return { state, top, bottom, renderTop, renderBottom, appendMoreCases, refreshRef };
}

export function build(slug: string): HTMLElement {
    const store = getRunewatchStore(slug);
    const w = buildRunewatchWiring();
    const observer = makeSentinelObserver(w.bottom.sentinel, w.appendMoreCases);
    const dispose = effect(() => {
        w.state.dataRef = store.data$();
        w.renderTop();
        w.renderBottom();
    });
    const cooldown = wireCooldown(w.top.refreshBtn, store);
    void store.ensure();
    w.refreshRef.fn = makeRefreshFn(slug, store, cooldown.hooks);
    const offRoute = events.on("route:change", () => {
        dispose.dispose();
        cooldown.dispose();
        observer.disconnect();
        offRoute();
    });
    const host = div(baseProps([HOST_CLASS, SHELL_CLASS]));
    host.setChildren(brandHead(), w.top.topPane, w.bottom.bottomPane);
    return host.el;
}
