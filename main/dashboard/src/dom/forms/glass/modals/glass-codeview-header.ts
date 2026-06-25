import { button, div, heading, icon, type Instance } from "../../../factory/index.js";
import {
    GLASS_CODEVIEW_CLOSE_CLASS,
    GLASS_CODEVIEW_HEADER_CLASS,
    GLASS_CODEVIEW_TITLE_CLASS,
} from "../../../../shared/constants/glass-constants.js";
import { buildSecretToggle } from "./glass-codeview-secret.js";
import type { CodeViewOptions } from "./glass-codeview-types.js";

export function buildCloseBtn(onClick: () => void): Instance<HTMLButtonElement> {
    return button(
        {
            classes: [GLASS_CODEVIEW_CLOSE_CLASS],
            ariaLabel: "Close",
            type: "button",
            context: "close the code view",
            meta: ["action"],
            onClick,
        },
        [icon({ name: "x-lg", context: null, meta: null })],
    );
}

export function buildHeader(opts: CodeViewOptions, preEl: Instance, closeBtn: Instance): Instance {
    const headerChildren: Instance[] = [
        heading("h2", { classes: [GLASS_CODEVIEW_TITLE_CLASS], text: opts.title, context: null, meta: null }),
    ];
    if (opts.secret) headerChildren.push(buildSecretToggle(preEl, false));
    headerChildren.push(closeBtn);
    return div({ classes: [GLASS_CODEVIEW_HEADER_CLASS], context: null, meta: null }, headerChildren);
}
