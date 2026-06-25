import { createLiveStore, div, liveView, paragraph, type Instance } from "../../../../factory";
import { events } from "../../../../../managers/events";
import type { PresentedEntry } from "../../../../../state/clans/audit-presenters/index.js";
import { buildFilterBar } from "./filters.js";
import { mountClusterRow, patchClusterRow } from "./row.js";
import { buildIntegrityIndicator, emptyStats, updateStats } from "./side-info.js";
import { type ClusterRow, currentFilters } from "../../../../../state/clans/audit/cluster-defs.js";
import { createAuditFeed } from "../../../../../state/clans/audit/cluster-feed.js";
import { PAGE_LIMIT } from "../../../../../state/clans/audit/types.js";
import { makeTabOps, type AuditTabOps, type AuditTabRefs } from "./audit-tab-ops.js";
import {
    AUDIT_EMPTY_CLASS,
    AUDIT_HOST_CLASS,
    AUDIT_LIST_CLASS,
    AUDIT_STATS_HOST_CLASS,
} from "../../../../../shared/constants/clan/audit-route-constants.js";

const TOPIC = "clan-audit";

function buildTabRefs(slug: string): AuditTabRefs {
    const host = div({ classes: [AUDIT_HOST_CLASS], context: null, meta: null });
    const statsHost = div({ classes: [AUDIT_STATS_HOST_CLASS], context: null, meta: null });
    const list = div({ classes: [AUDIT_LIST_CLASS], context: null, meta: null });
    const empty = paragraph({
        classes: [AUDIT_EMPTY_CLASS],
        text: "No audit entries yet.",
        hidden: "",
        context: null,
        meta: null,
    });
    return {
        host,
        statsHost,
        list,
        empty,
        state: { activeKind: "all", activeRange: "all" },
        statsRef: { value: emptyStats() },
        integrityIndicator: buildIntegrityIndicator(slug, list),
        feedRef: { v: null },
        storeRef: { v: null },
        viewRef: { v: null },
    };
}

function rebuildAuditTab(slug: string, refs: AuditTabRefs, ops: AuditTabOps): void {
    refs.viewRef.v?.teardown();
    refs.statsRef.value = emptyStats();
    ops.renderStats();
    refs.feedRef.v = createAuditFeed({
        slug,
        filters: currentFilters(refs.state.activeKind, refs.state.activeRange),
        limit: PAGE_LIMIT,
        onEntry: (e) => updateStats(refs.statsRef.value, e),
        onLoaded: () => {
            ops.renderStats();
            ops.renderLoadMore();
            ops.syncEmpty();
        },
    });
    refs.storeRef.v = createLiveStore<ClusterRow>({ topic: TOPIC, keyOf: (r) => r.key, source: refs.feedRef.v.source });
    refs.storeRef.v.onChange(() => {
        ops.renderStats();
        ops.syncEmpty();
    });
    mountAuditView(refs, slug);
}

function mountAuditView(refs: AuditTabRefs, slug: string): void {
    refs.viewRef.v = liveView<ClusterRow>({
        container: refs.list,
        store: refs.storeRef.v!,
        mountRow: (r) => mountClusterRow(r, slug),
        patchRow: (inst, r) => patchClusterRow(inst, r),
        rowContentVisibility: "row",
    });
    refs.viewRef.v.start();
}

interface FilterHandlers {
    onKindChange: (key: string) => void;
    onRangeChange: (key: string) => void;
}

function makeFilterHandlers(
    slug: string,
    refs: AuditTabRefs,
    ops: AuditTabOps,
    filterBarRef: { v: Instance },
): FilterHandlers {
    const refreshFilterBar = (): void => {
        const fresh = buildFilterBar(refs.state, onKindChange, onRangeChange, refs.integrityIndicator);
        filterBarRef.v.el.replaceWith(fresh.el);
        filterBarRef.v = fresh;
    };
    const applyKindRange = (axis: "activeKind" | "activeRange", key: string): void => {
        if (refs.state[axis] === key) return;
        refs.state[axis] = key;
        refreshFilterBar();
        rebuildAuditTab(slug, refs, ops);
    };
    function onKindChange(key: string): void {
        applyKindRange("activeKind", key);
    }
    function onRangeChange(key: string): void {
        applyKindRange("activeRange", key);
    }
    return { onKindChange, onRangeChange };
}

function buildAuditTab(slug: string): HTMLElement {
    const refs = buildTabRefs(slug);
    const ops = makeTabOps(refs);
    const filterBarRef: { v: Instance } = { v: null as unknown as Instance };
    const { onKindChange, onRangeChange } = makeFilterHandlers(slug, refs, ops, filterBarRef);
    filterBarRef.v = buildFilterBar(refs.state, onKindChange, onRangeChange, refs.integrityIndicator);
    refs.host.setChildren(filterBarRef.v, refs.statsHost, refs.list, refs.empty);
    rebuildAuditTab(slug, refs, ops);
    const offRoute = events.on("route:change", () => {
        refs.viewRef.v?.teardown();
        offRoute();
    });
    return refs.host.el;
}

import { defineManageTab } from "../registry";

defineManageTab({ key: "audit", build: (slug) => buildAuditTab(slug), order: 999 });

export { buildAuditTab };
export type { PresentedEntry };
