import { BTN_VARIANT_OUTLINE, button, div, header, span, treeView, type Instance } from "../../../factory";
import type { ScopeListItem } from "../../../../state/data-rights/data-rights-client/index.js";
import { folderNodeFor, scopeKeyFor, type LeafRef } from "./tree-nodes.js";
export { scopeKeyFor } from "./tree-nodes.js";
import {
    DR_PANE_HEADER_CLASS,
    DR_PANE_TITLE_CLASS,
    DR_TREE_WRAP_CLASS,
} from "../../../../shared/constants/rights-constants.js";
import { GLASS_PANE_INNER_CLASS } from "../../../../shared/constants/glass-constants.js";
import { IS_EMPTY_CLASS } from "../../../../shared/constants/state-modifier-constants.js";

const DISABLED_TRUE = "true";
const TITLE_BACK = "← Profile";
const TITLE_HEADING = "Databases";

export interface TreeState {
    scopes: ScopeListItem[];
    activeTableKey: string;
    expanded: Set<string>;
}

export interface TreeHandlers {
    onPickTable: (scope: ScopeListItem, table: string) => void;
    onToggleFolder: (scopeKey: string) => void;
    onBack?: () => void;
}

function buildTreeHeader(handlers: TreeHandlers): Instance {
    const children: Instance[] = [];
    if (handlers.onBack) {
        children.push(
            button({
                variant: BTN_VARIANT_OUTLINE,
                text: TITLE_BACK,
                context: "go back to your profile",
                meta: ["nav"],
                onClick: () => handlers.onBack!(),
            }),
        );
    }
    children.push(span({ classes: [DR_PANE_TITLE_CLASS], text: TITLE_HEADING, context: null, meta: null }));
    return header({ classes: [DR_PANE_HEADER_CLASS], context: null, meta: null }, children);
}

export interface TreeInstance extends Instance {
    setTableHasRows(scopeKey: string, table: string, hasRows: boolean): void;
}

function makeSetRows(leafRefs: Map<string, LeafRef>): TreeInstance["setTableHasRows"] {
    return (scopeKey, table, hasRows) => {
        const ref = leafRefs.get(`${scopeKey}:${table}`);
        if (!ref || ref.hasRows === hasRows) return;
        ref.hasRows = hasRows;
        ref.instance.toggleClass(IS_EMPTY_CLASS, !hasRows);
        if (hasRows) ref.instance.removeAttr("disabled");
        else ref.instance.setAttr("disabled", DISABLED_TRUE);
    };
}

export function buildTree(state: TreeState, handlers: TreeHandlers): TreeInstance {
    const leafRefs = new Map<string, LeafRef>();
    const nodes = state.scopes.map((s) =>
        folderNodeFor({
            scope: s,
            isExpanded: state.expanded.has(scopeKeyFor(s)),
            activeTableKey: state.activeTableKey,
            onPickTable: handlers.onPickTable,
            onToggleFolder: handlers.onToggleFolder,
            leafRefs,
        }),
    );
    const treeEl = treeView(nodes);
    const root = div({ classes: [GLASS_PANE_INNER_CLASS, DR_TREE_WRAP_CLASS], context: null, meta: null }, [
        buildTreeHeader(handlers),
        treeEl,
    ]);
    return Object.assign(root, { setTableHasRows: makeSetRows(leafRefs) });
}
