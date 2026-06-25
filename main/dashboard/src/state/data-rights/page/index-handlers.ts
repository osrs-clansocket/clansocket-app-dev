import { dataRightsClient } from "../data-rights-client/index.js";
import { writeUrl } from "../page-state/url.js";
import type { RowListHandlers } from "../../../dom/pages/routes/data-rights/rows/row-list/types.js";
import { isMobile } from "./index-state.js";
import type { DataRightsRefs } from "../../../dom/pages/routes/data-rights/index-refs.js";

function makeBulkDelete(
    refs: DataRightsRefs,
    rebuildList: () => Promise<void>,
    rerenderDetail: () => void,
): (from: number, to: number) => void {
    return (from, to) => {
        void (async () => {
            if (!refs.state.scope || !refs.state.table) return;
            await dataRightsClient.deleteRange(refs.state.scope, refs.state.table, from, to);
            refs.selectedKey.set(null);
            await rebuildList();
            rerenderDetail();
        })();
    };
}

export function buildHandlers(
    refs: DataRightsRefs,
    rebuildList: () => Promise<void>,
    rerenderDetail: () => void,
): RowListHandlers {
    return {
        onFilterChange: (from, to, rsn) => {
            refs.state.from = from;
            refs.state.to = to;
            refs.state.rsn = rsn;
            refs.selectedKey.set(null);
            writeUrl(refs.state);
            void rebuildList();
            rerenderDetail();
        },
        onBulkDelete: makeBulkDelete(refs, rebuildList, rerenderDetail),
        onBack: isMobile()
            ? () => {
                  refs.state.view = "tree";
                  refs.root.setAttr("data-view", refs.state.view);
              }
            : undefined,
    };
}
