import { div, section } from "../../../factory";
import type { PageState } from "../../../../state/data-rights/page-state/types.js";
import {
    DR_DETAIL_HOST_CLASS,
    DR_LIST_HOST_CLASS,
    DR_ROOT_CLASS,
    DR_TREE_HOST_CLASS,
} from "../../../../shared/constants/rights-constants.js";
import { GLASS_PANE_CLASS, GLASS_PANE_DIVIDED_CLASS } from "../../../../shared/constants/glass-constants.js";
import type { RenderOpts } from "../../../../state/data-rights/page/index-state.js";

const DR_EMBEDDED_CLASS = "route-data-rights--embedded";

export interface DataRightsHosts {
    root: ReturnType<typeof section>;
    treeHost: ReturnType<typeof div>;
    listHost: ReturnType<typeof div>;
    detailHost: ReturnType<typeof div>;
}

export function buildHosts(opts: RenderOpts, view: PageState["view"]): DataRightsHosts {
    const treeHost = div({
        classes: [GLASS_PANE_CLASS, GLASS_PANE_DIVIDED_CLASS, DR_TREE_HOST_CLASS],
        context: null,
        meta: null,
    });
    const listHost = div({
        classes: [GLASS_PANE_CLASS, GLASS_PANE_DIVIDED_CLASS, DR_LIST_HOST_CLASS],
        context: null,
        meta: null,
    });
    const detailHost = div({ classes: [GLASS_PANE_CLASS, DR_DETAIL_HOST_CLASS], context: null, meta: null });
    const rootClasses = opts.embedded === true ? [DR_ROOT_CLASS, DR_EMBEDDED_CLASS] : [DR_ROOT_CLASS];
    const root = section({ classes: rootClasses, data: { view }, context: null, meta: null }, [
        treeHost,
        listHost,
        detailHost,
    ]);
    return { root, treeHost, listHost, detailHost };
}
