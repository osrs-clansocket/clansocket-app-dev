import {
    div,
    liveView,
    type Instance,
    type LiveViewHandle,
    type ReadSignal,
    baseProps,
} from "../../../../../factory/index.js";
import { type BrowseResponse, type Scope } from "../../../../../../state/data-rights/data-rights-client/index.js";
import { createBrowseStore, type BrowseStoreHandle } from "../../../../../../state/data-rights/stores/browse-store.js";
import { mountDataRow, patchDataRow, type DataRowCtx } from "./row-item.js";
import { buildNotifyKit, makeScrollHandler, wireStoreChange } from "./live-list-notify.js";
import { DR_ROW_SCROLL_CLASS } from "../../../../../../shared/constants/rights-constants.js";
import type { RowListHandlers, RowListState } from "./types.js";

export interface RowListConfig {
    scope: Scope;
    table: string;
    from: number | null;
    to: number | null;
    rsn: string | null;
    limit: number;
    selectedKey: ReadSignal<string | null>;
    handlers: RowListHandlers;
    onSelectKey: (key: string) => void;
    onDeleteKey: (key: string) => void;
    managerView?: boolean;
}

function makeRowCtx(config: RowListConfig, info: BrowseResponse): DataRowCtx {
    return {
        table: config.table,
        pkCols: info.pkCols,
        tsCol: info.tsCol,
        secretColumns: info.secretColumns,
        canDeleteRow: info.canDeleteRow,
        selectedKey: config.selectedKey,
        onSelect: config.onSelectKey,
        onDelete: config.onDeleteKey,
    };
}

export interface RowListWiring {
    info: BrowseResponse;
    ctx: DataRowCtx;
    scroll: Instance;
    store: BrowseStoreHandle["store"];
    view: LiveViewHandle;
    notify: ReturnType<typeof buildNotifyKit>;
    loadMore: () => Promise<void>;
}

export interface RowWiringExt extends RowListWiring {
    onScroll: (e: Event) => void;
}

async function openBrowseHandle(config: RowListConfig, local: boolean): ReturnType<typeof createBrowseStore> {
    return createBrowseStore({
        local,
        scope: config.scope,
        table: config.table,
        from: config.from,
        to: config.to,
        rsn: config.rsn,
        limit: config.limit,
        managerView: config.managerView,
    });
}

export async function buildRowWiring(config: RowListConfig, local: boolean): Promise<RowWiringExt | null> {
    const handle = await openBrowseHandle(config, local);
    if (!handle) return null;
    const { info, store } = handle;
    const ctx = makeRowCtx(config, info);
    const scroll = div(baseProps([DR_ROW_SCROLL_CLASS]));
    const view: LiveViewHandle = liveView<Record<string, unknown>>({
        store,
        container: scroll,
        mountRow: (row) => mountDataRow(row, ctx),
        patchRow: (inst, row) => patchDataRow(inst, row, ctx),
        rowContentVisibility: "row",
    });
    const flags = { appending: false, loadingMore: false };
    const notify = buildNotifyKit(scroll);
    const loadMore = (): Promise<void> => handle.loadMore(flags);
    wireStoreChange({ store, scroll, notify, flags, seen: new Set<string>() });
    const onScroll = makeScrollHandler(scroll, notify, loadMore);
    scroll.el.addEventListener("scroll", onScroll, { passive: true });
    return { info, ctx, scroll, store, view, notify, loadMore, onScroll };
}

export function freshListState(config: RowListConfig, info: RowListWiring["info"]): RowListState {
    return {
        info,
        scope: config.scope,
        table: config.table,
        from: config.from,
        to: config.to,
        rsn: config.rsn,
        rows: [],
        selectedIndex: -1,
        loadingMore: false,
        hasMore: info.total > config.limit,
    };
}
