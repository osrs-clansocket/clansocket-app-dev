import { span, type Instance } from "../../../../factory";
import { ACCOUNT_AUTOCOMPLETE_DOT_CLASS } from "../../../../../shared/constants/account-constants.js";

export function buildColorDot(color: string | null): Instance {
    const dot = span({ classes: [ACCOUNT_AUTOCOMPLETE_DOT_CLASS], ariaHidden: "true", context: null, meta: null });
    if (color) dot.el.style.setProperty("--clan-accent", color);
    return dot;
}
