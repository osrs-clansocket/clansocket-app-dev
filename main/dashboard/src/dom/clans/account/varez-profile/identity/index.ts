import { div, paragraph, type Instance, baseProps, textProps } from "../../../../factory";
import { EMPTY_CLASS, LIST_CLASS, TREE_CLASS, getEditing, setEditing } from "../state.js";
import { renderSectionHeader } from "../shared.js";
import { renderEditableNode } from "./editable-node.js";
import { buildTree, emptyNode } from "./tree.js";
import { renderTreeNode } from "./tree-node.js";

function renderIdentityTree(list: Instance, identity: Record<string, string>, rerender: () => void): void {
    const tree = buildTree(identity);
    for (let i = 0; i < tree.children.length; i++) {
        renderTreeNode({
            host: list,
            node: tree.children[i]!,
            depth: 0,
            isLast: i === tree.children.length - 1,
            parentPrefix: "",
            rerender,
        });
    }
}

function maybeRenderEditor(list: Instance, editing: ReturnType<typeof getEditing>, rerender: () => void): void {
    if (editing?.kind !== "new-identity") return;
    renderEditableNode({
        rerender,
        host: list,
        node: emptyNode(""),
        depth: 0,
        isLast: true,
        parentPrefix: "",
        isNew: true,
    });
}

export function renderIdentity(host: Instance, identity: Record<string, string>, rerender: () => void): void {
    renderSectionHeader(host, "Identity", "+ add entry", () => {
        setEditing({ kind: "new-identity" });
        rerender();
    });
    const list = div(baseProps([LIST_CLASS, TREE_CLASS]));
    const editing = getEditing();
    maybeRenderEditor(list, editing, rerender);
    if (Object.keys(identity).length === 0 && editing?.kind !== "new-identity") {
        host.addChild(paragraph(textProps([EMPTY_CLASS], "No identity facts yet")));
        return;
    }
    renderIdentityTree(list, identity, rerender);
    host.addChild(list);
}
