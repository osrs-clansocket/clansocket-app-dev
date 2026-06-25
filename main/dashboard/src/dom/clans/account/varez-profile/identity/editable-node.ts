import { setEditing } from "../state.js";
import { buildTreeLink } from "./tree.js";
import type { NodeRenderArgs } from "./tree-node.js";
import { buildEditableInputs } from "./editable-inputs.js";
import { commitEdit } from "./editable-commit.js";
import { buildEditableRow } from "./editable-row.js";
import { makeKeydown } from "./editable-keydown.js";

export interface EditableNodeArgs extends NodeRenderArgs {
    isNew: boolean;
}

export function renderEditableNode(args: EditableNodeArgs): void {
    const { host, node, depth, isLast, parentPrefix, rerender, isNew } = args;
    const link = buildTreeLink(depth, isLast);
    const showValueField = node.fullKey !== null || isNew;
    const cancel = (): void => {
        setEditing(null);
        rerender();
    };
    const save = (): void => {
        if (!commitEdit({ inputs, isNew, node, parentPrefix })) return;
        setEditing(null);
        rerender();
    };
    const inputs = buildEditableInputs({ node, parentPrefix, showValueField, onKeydown: makeKeydown(save, cancel) });
    host.addChild(buildEditableRow({ inputs, link, showValueField, save, cancel }));
    queueMicrotask(() => inputs.segInput.el.focus());
}
