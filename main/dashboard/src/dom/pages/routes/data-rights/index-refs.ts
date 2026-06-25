import { signal, type Instance } from "../../../factory";
import type { PageState } from "../../../../state/data-rights/page-state/types.js";
import type { RowListHandle } from "./rows/row-list/live-list.js";
import type { TreeInstance } from "./tree";
import { buildHosts } from "../../../../state/data-rights/page/index-hosts.js";
import type { RenderOpts } from "../../../../state/data-rights/page/index-state.js";

export interface DataRightsRefs {
    root: Instance;
    treeHost: Instance;
    listHost: Instance;
    detailHost: Instance;
    state: PageState;
    selectedKey: ReturnType<typeof signal<string | null>>;
    liveHandleRef: { v: RowListHandle | null };
    treeInstanceRef: { v: TreeInstance | null };
    managerView: boolean;
}

export function initRefs(opts: RenderOpts, state: PageState): DataRightsRefs {
    const { root, treeHost, listHost, detailHost } = buildHosts(opts, state.view);
    return {
        root,
        treeHost,
        listHost,
        detailHost,
        state,
        selectedKey: signal<string | null>(null),
        liveHandleRef: { v: null },
        treeInstanceRef: { v: null },
        managerView: opts.embedded === true && opts.clanFilter !== undefined,
    };
}
