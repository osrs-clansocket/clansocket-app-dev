import "../../../../styles/components/tree/tree-component.css";
import { button } from "../../content-ops/button.js";
import { icon } from "../../content-ops/graphics/media.js";
import { div } from "../../layout-ops/structural/container.js";
import { onceEffect } from "../../effects/once-composer.js";
import type { Instance } from "../../core/index.js";
import { labelOrEditor, type OnLabelEdit } from "./tree-label.js";
import {
    actionsFor,
    buildActionsCluster,
    buildLeaf,
    wireNodeDnd,
    type BaseNodeRest,
    type TreeLeaf,
    type TreeLeafAction,
} from "./tree-leaf.js";
export type { ReorderEvent, TreeLeaf, TreeLeafAction } from "./tree-leaf.js";
export type { OnLabelEdit } from "./tree-label.js";
import { IS_EXPANDED_CLASS } from "../../../../shared/constants/state-modifier-constants.js";

const TREE_CLASS = "tree";
const TREE_NODE_CLASS = "tree__node";
const TREE_FOLDER_CLASS = "tree__folder";
const TREE_FOLDER_ROW_CLASS = "tree__folder-row";
const TREE_FOLDER_ACTIONS_CLASS = "tree__folder-actions";
const TREE_CHILDREN_CLASS = "tree__children";
const TREE_CHEVRON_CLASS = "tree__chevron";
const TREE_ICON_CLASS = "tree__icon";

const CHEVRON_EXPANDED = "chevron-down";
const CHEVRON_COLLAPSED = "chevron-right";

export interface TreeFolder extends BaseNodeRest {
    kind: "folder";
    isExpanded: boolean;
    children: readonly TreeNode[];
    onToggle: () => void;
    onLabelEdit?: OnLabelEdit;
    actions?: readonly TreeLeafAction[];
}

export type TreeNode = TreeLeaf | TreeFolder;

function folderHeaderChildren(node: TreeFolder, labelElements: readonly Instance[]): Instance[] {
    const chevron = icon({
        name: node.isExpanded ? CHEVRON_EXPANDED : CHEVRON_COLLAPSED,
        classes: [TREE_CHEVRON_CLASS],
        context: null,
        meta: null,
    });
    const out: Instance[] = [chevron];
    if (node.icon) out.push(node.icon);
    for (const el of labelElements) out.push(el);
    return out;
}

function folderHeader(folderBtn: Instance, actions: ReturnType<typeof actionsFor>): Instance {
    if (actions.length === 0) return folderBtn;
    const { host } = buildActionsCluster(actions, TREE_FOLDER_ACTIONS_CLASS);
    return div({ classes: [TREE_FOLDER_ROW_CLASS], context: null, meta: null }, [folderBtn, host]);
}

function folderButton(node: TreeFolder, folderClasses: string[], labelKit: ReturnType<typeof labelOrEditor>): Instance {
    return button(
        {
            classes: folderClasses,
            type: "button",
            ariaLabel: `toggle ${node.label}`,
            context: `expand or collapse ${node.label}`,
            meta: ["disclosure"],
            onClick: () => node.onToggle(),
        },
        folderHeaderChildren(node, labelKit.elements),
    );
}

function buildFolder(node: TreeFolder): Instance {
    const folderClasses = [TREE_FOLDER_CLASS];
    if (node.isExpanded) folderClasses.push(IS_EXPANDED_CLASS);
    const labelKit = labelOrEditor(node.label, node.onLabelEdit, { enableDblClick: false });
    const folderBtn = folderButton(node, folderClasses, labelKit);
    const header = folderHeader(folderBtn, actionsFor(node.label, labelKit.enterEdit, node.actions));
    const children: Instance[] = [header];
    if (node.isExpanded && node.children.length > 0) {
        children.push(
            div(
                { classes: [TREE_CHILDREN_CLASS], effects: onceEffect("fade-in"), context: null, meta: null },
                node.children.map(buildNode),
            ),
        );
    }
    wireNodeDnd(header.el, node, true);
    return div({ classes: [TREE_NODE_CLASS], context: null, meta: null }, children);
}

export function buildTreeNode(node: TreeNode): Instance {
    if (node.kind === "folder") return buildFolder(node);
    return buildLeaf(node);
}

function buildNode(node: TreeNode): Instance {
    return buildTreeNode(node);
}

export interface TreeViewOptions {
    variant?: "compact" | "comfortable";
}

export function treeView(nodes: readonly TreeNode[], opts: TreeViewOptions = {}): Instance {
    const classes = [TREE_CLASS];
    if (opts.variant === "comfortable") classes.push("tree--comfortable");
    return div({ classes, context: null, meta: null }, nodes.map(buildNode));
}

export { TREE_CLASS, TREE_ICON_CLASS };
