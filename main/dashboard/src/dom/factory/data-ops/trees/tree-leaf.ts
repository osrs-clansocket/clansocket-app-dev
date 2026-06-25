import { button } from "../../content-ops/button.js";
import { div } from "../../layout-ops/structural/container.js";
import { labelOrEditor, type OnLabelEdit } from "./tree-label.js";
import type { Instance } from "../../core/index.js";
import { IS_ACTIVE_CLASS, IS_EMPTY_CLASS } from "../../../../shared/constants/state-modifier-constants.js";
import { actionsFor, buildActionsCluster, type TreeLeafAction } from "./tree-leaf-action.js";
import { wireNodeDnd, type DndNodeRest as BaseNodeRest, type DndReorder as ReorderEvent } from "./tree-leaf-dnd.js";

export { actionsFor, buildActionsCluster, wireNodeDnd };
export type { BaseNodeRest, ReorderEvent, TreeLeafAction };

const TREE_LEAF_CLASS = "tree__leaf";
const TREE_LEAF_BODY_CLASS = "tree__leaf-body";
const TREE_LEAF_ACTIONS_CLASS = "tree__leaf-actions";
const TREE_LEAF_ROW_CLASS = "tree__leaf-row";
const DISABLED_TRUE = "true";

export interface TreeLeaf extends BaseNodeRest {
    kind: "leaf";
    isActive?: boolean;
    isEmpty?: boolean;
    title?: string;
    onClick?: () => void;
    onMount?: (inst: Instance) => void;
    onLabelEdit?: OnLabelEdit;
    actions?: readonly TreeLeafAction[];
}

function buildLeafBody(node: TreeLeaf, labelElements: readonly Instance[]): Instance {
    const classes = [TREE_LEAF_BODY_CLASS];
    if (node.isActive) classes.push(IS_ACTIVE_CLASS);
    if (node.isEmpty) classes.push(IS_EMPTY_CLASS);
    const children: Instance[] = [];
    if (node.icon) children.push(node.icon);
    for (const el of labelElements) children.push(el);
    return button(
        {
            classes,
            type: "button",
            title: node.title ?? node.label,
            ariaLabel: node.label,
            disabled: node.isEmpty ? DISABLED_TRUE : undefined,
            context: `select ${node.label}`,
            meta: ["nav"],
            onClick: () => {
                if (node.isEmpty) return;
                node.onClick?.();
            },
        },
        children,
    );
}

export function buildLeaf(node: TreeLeaf): Instance {
    const labelKit = labelOrEditor(node.label, node.onLabelEdit);
    const body = buildLeafBody(node, labelKit.elements);
    const rowChildren: Instance[] = [body];
    const actions = actionsFor(node.label, labelKit.enterEdit, node.actions);
    if (actions.length > 0) {
        const { host } = buildActionsCluster(actions, TREE_LEAF_ACTIONS_CLASS);
        rowChildren.push(host);
    }
    const row = div({ classes: [TREE_LEAF_ROW_CLASS, TREE_LEAF_CLASS], context: null, meta: null }, rowChildren);
    wireNodeDnd(row.el, node, false);
    node.onMount?.(body);
    return row;
}
