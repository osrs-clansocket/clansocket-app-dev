import type { PageState } from "../page-state/types.js";
import { buildTree, scopeKeyFor } from "../../../dom/pages/routes/data-rights/tree";
import type { DataRightsRefs } from "../../../dom/pages/routes/data-rights/index-refs.js";

export function buildRerenderTree(
    refs: DataRightsRefs,
    goBack: () => void,
    toggleFolder: (k: string) => void,
    onPickTable: (s: NonNullable<PageState["scopeItem"]>, t: string) => Promise<void>,
): () => void {
    return () => {
        const prevScroll = refs.treeHost.el.querySelector<HTMLElement>(".tree");
        const prevScrollTop = prevScroll?.scrollTop ?? 0;
        refs.treeInstanceRef.v = buildTree(
            {
                scopes: refs.state.scopes,
                activeTableKey:
                    refs.state.scopeItem && refs.state.table
                        ? `${scopeKeyFor(refs.state.scopeItem)}:${refs.state.table}`
                        : "",
                expanded: refs.state.expanded,
            },
            { onBack: goBack, onToggleFolder: toggleFolder, onPickTable },
        );
        refs.treeHost.setChildren(refs.treeInstanceRef.v);
        const nextScroll = refs.treeHost.el.querySelector<HTMLElement>(".tree");
        if (nextScroll) nextScroll.scrollTop = prevScrollTop;
    };
}
