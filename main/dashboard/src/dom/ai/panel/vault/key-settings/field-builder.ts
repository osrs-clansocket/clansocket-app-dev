import { label, span } from "../../../../factory/content-ops/index.js";
import type { Instance } from "../../../../factory/index.js";
import { FIELD_CLASS, FIELD_LABEL_CLASS } from "./constants.js";
import { baseProps, textProps } from "../../../../factory/index.js";

export function buildField(labelText: string, child: Instance<HTMLElement>): Instance<HTMLLabelElement> {
    return label(baseProps([FIELD_CLASS]), [span(textProps([FIELD_LABEL_CLASS], labelText)), child]);
}
