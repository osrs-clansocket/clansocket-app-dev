import { input, type Instance } from "../../../../factory";
import { INLINE_INPUT_CLASS, TREE_VALUE_CLASS } from "../state.js";
import type { KeydownHandler } from "./seg-input.js";

export function buildValInput(node: { value?: string | null }, onKeydown: KeydownHandler): Instance<HTMLInputElement> {
    return input({
        classes: [INLINE_INPUT_CLASS, TREE_VALUE_CLASS],
        value: node.value ?? "",
        placeholder: "Value",
        ariaLabel: "Identity value",
        context: "edit the identity value",
        meta: ["input"],
        onKeydown,
    });
}
