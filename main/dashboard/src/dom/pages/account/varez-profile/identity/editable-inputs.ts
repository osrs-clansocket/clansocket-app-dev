import { type Instance } from "../../../../factory";
import { buildSegInput, type KeydownHandler } from "./seg-input.js";
import { buildValInput } from "./val-input.js";

export interface EditableInputs {
    segInput: Instance<HTMLInputElement>;
    valInput: Instance<HTMLInputElement> | null;
}

export function buildEditableInputs(args: {
    node: { name: string; value?: string | null };
    parentPrefix: string;
    showValueField: boolean;
    onKeydown: KeydownHandler;
}): EditableInputs {
    const { node, parentPrefix, showValueField, onKeydown } = args;
    return {
        segInput: buildSegInput(node, parentPrefix, onKeydown),
        valInput: showValueField ? buildValInput(node, onKeydown) : null,
    };
}
