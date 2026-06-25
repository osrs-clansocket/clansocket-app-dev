import { dataRightsClient } from "../data-rights-client/index.js";
import { PAGE_SIZE } from "../page-state/constants.js";
import { deleteLocalRow, isLocalScope } from "../local-source.js";
import { buildRowDetail } from "../../../dom/pages/routes/data-rights/rows/row-detail.js";
import { buildRowList } from "../../../dom/pages/routes/data-rights/rows/row-list/live-list.js";
import type { RowListHandlers } from "../../../dom/pages/routes/data-rights/rows/row-list/types.js";
import { emptyPara } from "./index-hosts.js";
import { isMobile } from "./index-state.js";
import type { DataRightsRefs } from "../../../dom/pages/routes/data-rights/index-refs.js";
export { buildRerenderTree } from "./index-tree-renderer.js";
export { buildHandlers } from "./index-handlers.js";

export function buildRerenderDetail(refs: DataRightsRefs): () => void {
    const rerenderDetail = (): void => {
        const row = refs.liveHandleRef.v?.getRow(refs.selectedKey() ?? "") ?? null;
        refs.detailHost.setChildren(
            buildRowDetail(
                {
                    row,
                    scope: refs.state.scope!,
                    table: refs.state.table ?? "",
                    info: refs.liveHandleRef.v?.info ?? null,
                },
                {
                    onBack: isMobile()
                        ? () => {
                              refs.state.view = "list";
                              refs.root.setAttr("data-view", refs.state.view);
                              rerenderDetail();
                          }
                        : undefined,
                },
            ),
        );
    };
    return rerenderDetail;
}

interface RebuildListArgs {
    refs: DataRightsRefs;
    rerenderDetail: () => void;
    handlers: RowListHandlers;
    onSelectKey: (k: string) => void;
    onDeleteKey: (k: string) => Promise<void>;
}

async function buildMountHandle(args: RebuildListArgs): Promise<ReturnType<typeof buildRowList> | null> {
    const { refs, handlers, onSelectKey, onDeleteKey } = args;
    return buildRowList({
        handlers,
        onSelectKey,
        scope: refs.state.scope!,
        table: refs.state.table!,
        from: refs.state.from,
        to: refs.state.to,
        rsn: refs.state.rsn,
        limit: PAGE_SIZE,
        selectedKey: refs.selectedKey,
        onDeleteKey: (k) => void onDeleteKey(k),
        managerView: refs.managerView,
    });
}

export function buildRebuildList(args: RebuildListArgs): () => Promise<void> {
    const { refs, rerenderDetail } = args;
    return async () => {
        refs.liveHandleRef.v?.teardown();
        refs.liveHandleRef.v = null;
        if (!refs.state.scope || !refs.state.table) {
            refs.listHost.setChildren(emptyPara("Pick a table from the tree."));
            return;
        }
        refs.listHost.setChildren(emptyPara("Loading…"));
        const handle = await buildMountHandle(args);
        if (!handle) {
            refs.listHost.setChildren(emptyPara("No data."));
            return;
        }
        refs.liveHandleRef.v = handle;
        handle.onChange((change) => {
            const key = refs.selectedKey();
            if (key !== null && change.changed.has(key)) rerenderDetail();
        });
        refs.listHost.setChildren(handle.el);
    };
}

export function buildDeleteKey(
    refs: DataRightsRefs,
    rebuildList: () => Promise<void>,
    rerenderDetail: () => void,
): (key: string) => Promise<void> {
    return async (key) => {
        if (!refs.state.scope || !refs.state.table || !refs.liveHandleRef.v) return;
        const row = refs.liveHandleRef.v.getRow(key);
        if (!row) return;
        const pkRow: Record<string, unknown> = {};
        for (const k of refs.liveHandleRef.v.info.pkCols) pkRow[k] = row[k];
        if (isLocalScope(refs.state.scope)) {
            deleteLocalRow(refs.state.scope, refs.state.table, pkRow);
            await rebuildList();
        } else {
            await dataRightsClient.deleteRow(refs.state.scope, refs.state.table, pkRow);
        }
        if (refs.selectedKey() === key) {
            refs.selectedKey.set(null);
            rerenderDetail();
        }
    };
}
