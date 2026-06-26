import { div, type Instance, type LiveChange, baseProps } from "../../../../../factory/index.js";
import { type BrowseResponse } from "../../../../../../state/data-rights/data-rights-client/index.js";
import { isLocalScope } from "../../../../../../state/data-rights/local-source.js";
import { buildFilterBar } from "./filter-bar.js";
import { buildHeader } from "./header.js";
import { buildRowWiring, freshListState, type RowListConfig } from "./live-list-wiring.js";
export type { RowListConfig } from "./live-list-wiring.js";
import { DR_LIST_PANE_CLASS, DR_ROW_SCROLL_WRAP_CLASS } from "../../../../../../shared/constants/rights-constants.js";
import { GLASS_PANE_INNER_CLASS } from "../../../../../../shared/constants/glass-constants.js";

export interface RowListHandle {
    el: HTMLElement;
    info: BrowseResponse;
    getRow(key: string): Record<string, unknown> | undefined;
    onChange(listener: (change: LiveChange) => void): () => void;
    teardown(): void;
}

function assembleRowPane(args: {
    config: RowListConfig;
    w: NonNullable<Awaited<ReturnType<typeof buildRowWiring>>>;
}): Instance {
    const { config, w } = args;
    const listState = freshListState(config, w.info);
    const header = buildHeader(listState, config.handlers);
    const filter = buildFilterBar(listState, config.handlers);
    const scrollWrap = div(baseProps([DR_ROW_SCROLL_WRAP_CLASS]), [w.scroll, w.notify.notifyBtn]);
    return div(baseProps([GLASS_PANE_INNER_CLASS, DR_LIST_PANE_CLASS]), [header.instance, filter, scrollWrap]);
}

export async function buildRowList(config: RowListConfig): Promise<RowListHandle | null> {
    const local = isLocalScope(config.scope);
    const w = await buildRowWiring(config, local);
    if (!w) return null;
    const { info, scroll, store, view, onScroll } = w;
    const pane = assembleRowPane({ config, w });
    view.start();
    return {
        info,
        el: pane.el,
        getRow: (key) => store.get(key),
        onChange: (listener) => store.onChange(listener),
        teardown: () => {
            scroll.el.removeEventListener("scroll", onScroll);
            view.teardown();
        },
    };
}
