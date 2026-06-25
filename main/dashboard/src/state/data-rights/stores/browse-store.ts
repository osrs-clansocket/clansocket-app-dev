import { createLiveStore, type LiveSource } from "../../../dom/factory/live-ops/index.js";
import { dataRightsClient, type BrowseResponse, type Scope } from "../data-rights-client/index.js";
import { projectionSource } from "../data-rights-client/streams/projection-source.js";
import { browseLocal } from "../local-source.js";
import { pkKeyOf } from "../page-state/formatters/pk-key-formatter.js";

export interface BrowseStoreConfig {
    scope: Scope;
    table: string;
    from: number | null;
    to: number | null;
    rsn: string | null;
    limit: number;
    local: boolean;
    managerView?: boolean;
}

export interface BrowseStoreHandle {
    info: BrowseResponse;
    store: ReturnType<typeof createLiveStore<Record<string, unknown>>>;
    loadMore: (flags: { loadingMore: boolean; appending: boolean }) => Promise<void>;
}

function localLiveSource(scope: Scope, table: string, limit: number): LiveSource {
    return {
        subscribe(onSnapshot): () => void {
            onSnapshot({ topic: `local:${table}`, seq: 0, rows: browseLocal(scope, table, limit, 0).rows });
            return () => {};
        },
    };
}

function fetchInitial(config: BrowseStoreConfig): Promise<BrowseResponse | null> {
    if (config.local) return Promise.resolve(browseLocal(config.scope, config.table, config.limit, 0));
    return dataRightsClient.browse({
        scope: config.scope,
        table: config.table,
        from: config.from ?? undefined,
        to: config.to ?? undefined,
        rsn: config.rsn ?? undefined,
        limit: config.limit,
        offset: 0,
        managerView: config.managerView,
    });
}

function makeStoreSource(config: BrowseStoreConfig): LiveSource {
    if (config.local) return localLiveSource(config.scope, config.table, config.limit);
    return projectionSource({
        kind: config.scope.kind,
        clanId: config.scope.clanId,
        mode: config.scope.mode,
        table: config.table,
        from: config.from ?? undefined,
        to: config.to ?? undefined,
        rsn: config.rsn ?? undefined,
        limit: config.limit,
        offset: 0,
        managerView: config.managerView === true ? "true" : undefined,
    });
}

async function fetchNextPage(config: BrowseStoreConfig, offset: number): Promise<BrowseResponse | null> {
    if (config.local) return browseLocal(config.scope, config.table, config.limit, offset);
    return dataRightsClient.browse({
        offset,
        scope: config.scope,
        table: config.table,
        from: config.from ?? undefined,
        to: config.to ?? undefined,
        rsn: config.rsn ?? undefined,
        limit: config.limit,
        managerView: config.managerView,
    });
}

export async function createBrowseStore(config: BrowseStoreConfig): Promise<BrowseStoreHandle | null> {
    const info = await fetchInitial(config);
    if (info === null) return null;
    const store = createLiveStore<Record<string, unknown>>({
        topic: `${config.scope.kind}:${config.scope.clanId ?? ""}:${config.scope.mode ?? ""}:${config.table}`,
        keyOf: (row) => pkKeyOf(row, info.pkCols),
        source: makeStoreSource(config),
    });
    const loadMore = async (flags: { loadingMore: boolean; appending: boolean }): Promise<void> => {
        if (flags.loadingMore || store.size() >= info.total) return;
        flags.loadingMore = true;
        const page = await fetchNextPage(config, store.size());
        flags.loadingMore = false;
        if (page) {
            flags.appending = true;
            store.appendRows(page.rows);
            flags.appending = false;
        }
    };
    return { info, store, loadMore };
}
