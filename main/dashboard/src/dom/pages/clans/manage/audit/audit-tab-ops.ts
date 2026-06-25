import { button, type Instance, type LiveStore, type LiveViewHandle } from "../../../../factory";
import type { AuditFeed } from "../../../../../state/clans/audit/cluster-feed.js";
import type { ClusterRow } from "../../../../../state/clans/audit/cluster-defs.js";
import { buildAnalyticsStrip, emptyStats } from "./side-info.js";
import type { FilterBarState } from "./filters.js";
import {
    AUDIT_ROW_CLASS,
    AUDIT_ROW_LOAD_MORE_CLASS,
} from "../../../../../shared/constants/clan/audit-route-constants.js";

export interface AuditTabRefs {
    host: Instance;
    statsHost: Instance;
    list: Instance;
    empty: Instance;
    state: FilterBarState;
    statsRef: { value: ReturnType<typeof emptyStats> };
    integrityIndicator: Instance;
    feedRef: { v: AuditFeed | null };
    storeRef: { v: LiveStore<ClusterRow> | null };
    viewRef: { v: LiveViewHandle | null };
}

export interface AuditTabOps {
    renderStats: () => void;
    renderLoadMore: () => void;
    syncEmpty: () => void;
    doLoadMore: () => Promise<void>;
    loadMoreRow: Instance<HTMLButtonElement>;
}

function buildLoadRow(opsRef: { o: AuditTabOps | null }): Instance<HTMLButtonElement> {
    return button({
        classes: [AUDIT_ROW_CLASS, AUDIT_ROW_LOAD_MORE_CLASS],
        text: "Load more",
        context: "load more audit entries",
        meta: ["action", "audit"],
        onClick: () => void opsRef.o?.doLoadMore(),
    });
}

function makeLoadOps(args: { refs: AuditTabRefs; loadMoreRow: Instance<HTMLButtonElement> }): {
    renderLoadMore: () => void;
    doLoadMore: () => Promise<void>;
} {
    const { refs, loadMoreRow } = args;
    const renderLoadMore = (): void => {
        if (refs.feedRef.v?.hasMore()) {
            refs.list.addChild(loadMoreRow);
            loadMoreRow.el.disabled = false;
            loadMoreRow.setText("Load more");
        } else loadMoreRow.detach();
    };
    const doLoadMore = async (): Promise<void> => {
        if (!refs.feedRef.v || !refs.storeRef.v) return;
        loadMoreRow.el.disabled = true;
        loadMoreRow.setText("Loading…");
        refs.storeRef.v.appendRows(await refs.feedRef.v.loadFeedMore());
        renderLoadMore();
    };
    return { renderLoadMore, doLoadMore };
}

export function makeTabOps(refs: AuditTabRefs): AuditTabOps {
    const renderStats = (): void => {
        refs.statsHost.setChildren(buildAnalyticsStrip(refs.statsRef.value));
    };
    const syncEmpty = (): void => {
        refs.empty.el.hidden = (refs.storeRef.v?.size() ?? 0) > 0;
    };
    const opsRef: { o: AuditTabOps | null } = { o: null };
    const loadMoreRow = buildLoadRow(opsRef);
    const { renderLoadMore, doLoadMore } = makeLoadOps({ refs, loadMoreRow });
    opsRef.o = { renderStats, renderLoadMore, syncEmpty, doLoadMore, loadMoreRow };
    return opsRef.o;
}
