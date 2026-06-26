import { input, type Instance } from "../../../../factory";
import { INLINE_INPUT_CLASS, TREE_SEGMENT_CLASS } from "../state.js";

export type KeydownHandler = (e: KeyboardEvent) => void;

export function buildSegInput(
    node: { name: string },
    parentPrefix: string,
    onKeydown: KeydownHandler,
): Instance<HTMLInputElement> {
    return input({
        classes: [INLINE_INPUT_CLASS, TREE_SEGMENT_CLASS],
        value: node.name,
        placeholder: parentPrefix.length === 0 ? "key (dots = depth)" : "name",
        ariaLabel: "Identity key",
        context: "edit the identity key segment",
        meta: ["input"],
        onKeydown,
    });
}
