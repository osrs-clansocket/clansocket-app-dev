import { flashInvalid } from "../../../../factory";
import { isValidKey, profileStore } from "../../../../../ai/profile-store";
import { INLINE_INPUT_INVALID_CLASS } from "../state.js";
import type { EditableInputs } from "./editable-inputs.js";

function markInvalid(inputs: EditableInputs, withFocus: boolean): false {
    inputs.segInput.el.classList.add(INLINE_INPUT_INVALID_CLASS);
    flashInvalid(inputs.segInput.el);
    if (withFocus) inputs.segInput.el.focus();
    return false;
}

function commitNew(inputs: EditableInputs, newPath: string): boolean {
    if (!profileStore.setIdentity(newPath, inputs.valInput!.el.value)) return markInvalid(inputs, false);
    return true;
}

function commitRename(inputs: EditableInputs, oldPath: string, newPath: string): boolean {
    if (oldPath !== newPath) profileStore.renamePrefix(oldPath, newPath);
    if (inputs.valInput !== null) profileStore.setIdentity(newPath, inputs.valInput.el.value);
    return true;
}

export function commitEdit(args: {
    inputs: EditableInputs;
    isNew: boolean;
    node: { name: string };
    parentPrefix: string;
}): boolean {
    const { inputs, isNew, node, parentPrefix } = args;
    const newPath = parentPrefix + inputs.segInput.el.value.trim();
    if (!isValidKey(newPath)) return markInvalid(inputs, true);
    if (isNew) return commitNew(inputs, newPath);
    return commitRename(inputs, parentPrefix + node.name, newPath);
}
