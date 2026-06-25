import { label, span } from "../../../../factory/content-ops/index.js";
import type { Instance } from "../../../../factory/index.js";
import { FIELD_CLASS, FIELD_LABEL_CLASS } from "./constants.js";

export function buildField(labelText: string, child: Instance<HTMLElement>): Instance<HTMLLabelElement> {
    return label({ classes: [FIELD_CLASS], context: null, meta: null }, [
        span({ classes: [FIELD_LABEL_CLASS], text: labelText, context: null, meta: null }),
        child,
    ]);
}
