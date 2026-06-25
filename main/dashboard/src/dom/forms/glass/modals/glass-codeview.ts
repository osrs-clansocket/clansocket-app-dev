import { code, createInstance, modal, pre, scrollContainer } from "../../../factory/index.js";
import {
    GLASS_CODEVIEW_CLASS,
    GLASS_CODEVIEW_PRE_CLASS,
    GLASS_CODEVIEW_SCROLL_CLASS,
    GLASS_CONFIRM_OPEN_CLASS,
    GLASS_CONFIRM_OVERLAY_CLASS,
} from "../../../../shared/constants/glass-constants.js";
import { buildPrettyCode } from "./glass-codeview-pretty.js";
import { buildCloseBtn, buildHeader } from "./glass-codeview-header.js";
import type { CodeViewOptions } from "./glass-codeview-types.js";

export type { CodeViewOptions } from "./glass-codeview-types.js";

export function glassCodeView(opts: CodeViewOptions): void {
    const preEl = pre({ classes: [GLASS_CODEVIEW_PRE_CLASS], context: null, meta: null }, [
        code({ text: buildPrettyCode(opts.content), context: null, meta: null }),
    ]);
    const scrollWrap = scrollContainer({ classes: [GLASS_CODEVIEW_SCROLL_CLASS], context: null, meta: null }, [preEl]);
    const closeBtn = buildCloseBtn(() => m.dismiss());
    const headerEl = buildHeader(opts, preEl, closeBtn);
    const m = modal(
        {
            overlayClasses: [GLASS_CONFIRM_OVERLAY_CLASS],
            dialogClasses: [GLASS_CODEVIEW_CLASS],
            openClass: GLASS_CONFIRM_OPEN_CLASS,
            context: null,
            meta: null,
            initialFocus: () => closeBtn.el,
        },
        [headerEl, scrollWrap],
    );
    const dialogInst = createInstance(m.dialogEl);
    dialogInst.setAttr("role", "dialog");
    dialogInst.setAttr("aria-modal", "true");
    createInstance(document.body).addChild(m);
    m.open();
}
