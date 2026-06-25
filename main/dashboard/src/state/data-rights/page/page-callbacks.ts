import type { PageState } from "../page-state/types.js";
import { writeUrl } from "../page-state/url.js";
import type { RowListHandlers } from "../../../dom/pages/routes/data-rights/rows/row-list/types.js";
import { applyTablePick, isMobile } from "./index-state.js";
import { emptyPara } from "./index-hosts.js";
import type { DataRightsRefs } from "../../../dom/pages/routes/data-rights/index-refs.js";
import {
    buildDeleteKey,
    buildHandlers,
    buildRebuildList,
    buildRerenderDetail,
    buildRerenderTree,
} from "./index-renderers.js";

function makeKeyHandler(refs: DataRightsRefs, rerenderDetail: () => void): (key: string) => void {
    return (key) => {
        refs.selectedKey.set(key);
        refs.state.view = isMobile() ? "detail" : refs.state.view;
        refs.root.setAttr("data-view", refs.state.view);
        rerenderDetail();
    };
}

function makeToggleFolder(refs: DataRightsRefs, rerenderTreeRef: { fn: () => void }): (k: string) => void {
    return (k) => {
        if (refs.state.expanded.has(k)) refs.state.expanded.delete(k);
        else refs.state.expanded.add(k);
        rerenderTreeRef.fn();
    };
}

function makeTableHandler(args: {
    refs: DataRightsRefs;
    rerenderTreeRef: { fn: () => void };
    rebuildListRef: { fn: () => Promise<void> };
    rerenderDetail: () => void;
}): (s: NonNullable<PageState["scopeItem"]>, t: string) => Promise<void> {
    const { refs, rerenderTreeRef, rebuildListRef, rerenderDetail } = args;
    return async (s, t) => {
        applyTablePick(refs.state, s, t);
        refs.selectedKey.set(null);
        refs.root.setAttr("data-view", refs.state.view);
        writeUrl(refs.state);
        rerenderTreeRef.fn();
        refs.detailHost.setChildren(emptyPara("Select a row to view."));
        await rebuildListRef.fn();
        rerenderDetail();
    };
}

function wireListPipeline(args: { refs: DataRightsRefs; rerenderDetail: () => void }): {
    rebuildListRef: { fn: () => Promise<void> };
    onSelectKey: ReturnType<typeof makeKeyHandler>;
} {
    const { refs, rerenderDetail } = args;
    const handlersRef: { h: RowListHandlers | null } = { h: null };
    const onSelectKey = makeKeyHandler(refs, rerenderDetail);
    const rebuildListRef: { fn: () => Promise<void> } = { fn: async () => undefined };
    const onDeleteKey = buildDeleteKey(refs, () => rebuildListRef.fn(), rerenderDetail);
    rebuildListRef.fn = buildRebuildList({
        refs,
        rerenderDetail,
        onSelectKey,
        onDeleteKey,
        handlers: handlersRef.h ?? ({} as RowListHandlers),
    });
    handlersRef.h = buildHandlers(refs, rebuildListRef.fn, rerenderDetail);
    rebuildListRef.fn = buildRebuildList({ refs, rerenderDetail, onSelectKey, onDeleteKey, handlers: handlersRef.h });
    return { rebuildListRef, onSelectKey };
}

export function buildCallbacks(refs: DataRightsRefs): {
    rebuildListRef: { fn: () => Promise<void> };
    rerenderTreeRef: { fn: () => void };
    rerenderDetail: () => void;
} {
    const rerenderDetail = buildRerenderDetail(refs);
    const { rebuildListRef } = wireListPipeline({ refs, rerenderDetail });
    const rerenderTreeRef: { fn: () => void } = { fn: () => undefined };
    const goBack = (): void => {
        history.pushState(null, "", "/account");
        window.dispatchEvent(new PopStateEvent("popstate"));
    };
    const toggleFolder = makeToggleFolder(refs, rerenderTreeRef);
    const onPickTable = makeTableHandler({ refs, rerenderTreeRef, rebuildListRef, rerenderDetail });
    rerenderTreeRef.fn = buildRerenderTree(refs, goBack, toggleFolder, onPickTable);
    return { rebuildListRef, rerenderTreeRef, rerenderDetail };
}
