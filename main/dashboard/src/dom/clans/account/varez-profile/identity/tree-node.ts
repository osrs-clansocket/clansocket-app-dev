import { div, span, type Instance, baseProps, textProps } from "../../../../factory";
import { isReservedKey, profileStore } from "../../../../../ai/profile-store";
import {
    ROW_ACTIONS_CLASS,
    TREE_BRANCH_CLASS,
    TREE_LEAF_CLASS,
    TREE_LINK_CLASS,
    TREE_ROW_CLASS,
    TREE_SEGMENT_CLASS,
    TREE_VALUE_CLASS,
    getEditing,
    setEditing,
} from "../state.js";
import { iconBtn } from "../shared.js";
import { renderEditableNode } from "./editable-node.js";
import { buildTreeLink } from "./tree.js";

import type { NodeRenderArgs } from "./render-args.js";

export type { NodeRenderArgs } from "./render-args.js";

function buildRowActions(nodePath: string, hasChildren: boolean, rerender: () => void): Instance {
    return div(baseProps([ROW_ACTIONS_CLASS]), [
        iconBtn("pencil", "edit", () => {
            setEditing({ kind: "edit-identity", key: nodePath });
            rerender();
        }),
        iconBtn("trash", "remove", () => {
            if (hasChildren) profileStore.removePrefix(nodePath);
            else profileStore.removeIdentity(nodePath);
            const cur = getEditing();
            if (cur?.kind === "edit-identity" && cur.key === nodePath) setEditing(null);
            rerender();
        }),
    ]);
}

interface StaticRowArgs {
    host: Instance;
    node: NodeRenderArgs["node"];
    depth: number;
    isLast: boolean;
    isLeaf: boolean;
    isReserved: boolean;
    nodePath: string;
    hasChildren: boolean;
    rerender: () => void;
}

function buildStaticRow(args: StaticRowArgs): void {
    const { host, node, depth, isLast, isLeaf, isReserved, nodePath, hasChildren, rerender } = args;
    const link = buildTreeLink(depth, isLast);
    const row = div(baseProps([TREE_ROW_CLASS, isLeaf ? TREE_LEAF_CLASS : TREE_BRANCH_CLASS]));
    if (link.length > 0) row.addChild(span(textProps([TREE_LINK_CLASS], link)));
    row.addChild(span(textProps([TREE_SEGMENT_CLASS], node.name)));
    if (isLeaf) row.addChild(span(textProps([TREE_VALUE_CLASS], node.value ?? "")));
    if (!isReserved) row.addChild(buildRowActions(nodePath, hasChildren, rerender));
    host.addChild(row);
}

export function renderTreeNode(args: NodeRenderArgs): void {
    const { host, node, depth, isLast, parentPrefix, rerender } = args;
    const isLeaf = node.fullKey !== null;
    const hasChildren = node.children.length > 0;
    const nodePath = parentPrefix + node.name;
    const isReserved = isReservedKey(nodePath);
    const editing = getEditing();
    const isEditing = !isReserved && editing?.kind === "edit-identity" && editing.key === nodePath;

    if (isEditing) renderEditableNode({ ...args, isNew: false });
    else buildStaticRow({ host, node, depth, isLast, isLeaf, isReserved, nodePath, hasChildren, rerender });

    const childPrefix = nodePath + ".";
    for (let i = 0; i < node.children.length; i++) {
        renderTreeNode({
            host,
            rerender,
            node: node.children[i]!,
            depth: depth + 1,
            isLast: i === node.children.length - 1,
            parentPrefix: childPrefix,
        });
    }
}
