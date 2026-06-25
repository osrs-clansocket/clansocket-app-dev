import { div, span, type Instance } from "../../../../factory";
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
    const row = div({ classes: rowClasses, context: null, meta: null });
    if (link.length > 0) row.addChild(span({ classes: [TREE_LINK_CLASS], text: link, context: null, meta: null }));
    row.addChild(inputs.segInput);
    if (inputs.valInput !== null) row.addChild(inputs.valInput);
    row.addChild(
        div({ classes: [ROW_ACTIONS_CLASS], context: null, meta: null }, [
            iconBtn("check-lg", "save", save),
            iconBtn("x-lg", "cancel", cancel),
        ]),
    );
    return row;
}
