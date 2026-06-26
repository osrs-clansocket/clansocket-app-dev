import { div, span, type Instance, baseProps, textProps } from "../../../../factory";
import {
    ROW_ACTIONS_CLASS,
    TREE_BRANCH_CLASS,
    TREE_LEAF_CLASS,
    TREE_LINK_CLASS,
    TREE_ROW_CLASS,
    TREE_ROW_EDITING_CLASS,
} from "../state.js";
import { iconBtn } from "../shared.js";
import type { EditableInputs } from "./editable-inputs.js";

export function buildEditableRow(args: {
    inputs: EditableInputs;
    link: string;
    showValueField: boolean;
    save: () => void;
    cancel: () => void;
}): Instance {
    const { inputs, link, showValueField, save, cancel } = args;
    const rowClasses = [TREE_ROW_CLASS, showValueField ? TREE_LEAF_CLASS : TREE_BRANCH_CLASS, TREE_ROW_EDITING_CLASS];
    const row = div(baseProps(rowClasses));
    if (link.length > 0) row.addChild(span(textProps([TREE_LINK_CLASS], link)));
    row.addChild(inputs.segInput);
    if (inputs.valInput !== null) row.addChild(inputs.valInput);
    row.addChild(
        div(baseProps([ROW_ACTIONS_CLASS]), [iconBtn("check-lg", "save", save), iconBtn("x-lg", "cancel", cancel)]),
    );
    return row;
}
