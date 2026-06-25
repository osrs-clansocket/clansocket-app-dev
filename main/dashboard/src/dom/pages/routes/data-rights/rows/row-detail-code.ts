import { code, div, heading, pre, scrollContainer, type Instance } from "../../../../factory/index.js";
import {
    GLASS_CODEVIEW_CLASS,
    GLASS_CODEVIEW_HEADER_CLASS,
    GLASS_CODEVIEW_PRE_CLASS,
    GLASS_CODEVIEW_SCROLL_CLASS,
    GLASS_CODEVIEW_TITLE_CLASS,
} from "../../../../../shared/constants/glass-constants.js";
import { maybePrettyCode } from "../../../../../shared/formatters/code-pretty-formatter.js";
import { buildSecretToggle } from "./detail-secret-toggle.js";

export function codePanel(col: string, text: string, isSecret: boolean): Instance {
    const pretty = maybePrettyCode(text);
    const codeEl = code({ text: pretty, context: null, meta: null });
    const preEl = pre({ classes: [GLASS_CODEVIEW_PRE_CLASS], context: null, meta: null }, [codeEl]);
    const scrollWrap = scrollContainer({ classes: [GLASS_CODEVIEW_SCROLL_CLASS], context: null, meta: null }, [preEl]);
    const headerChildren: Instance[] = [
        heading("h3", { classes: [GLASS_CODEVIEW_TITLE_CLASS], text: col, context: null, meta: null }),
    ];
    if (isSecret) headerChildren.push(buildSecretToggle(preEl, false));
    const headerEl = div({ classes: [GLASS_CODEVIEW_HEADER_CLASS], context: null, meta: null }, headerChildren);
    return div({ classes: [GLASS_CODEVIEW_CLASS], context: null, meta: null }, [headerEl, scrollWrap]);
}
