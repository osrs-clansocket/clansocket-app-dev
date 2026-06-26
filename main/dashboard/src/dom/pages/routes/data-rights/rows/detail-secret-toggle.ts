import { button, icon, span, type Instance, baseProps } from "../../../../factory/index.js";
import {
    GLASS_CODEVIEW_PRE_BLURRED_CLASS,
    GLASS_SECRET_TOGGLE_CLASS,
} from "../../../../../shared/constants/glass-constants.js";

function renderRevealIcon(wrap: Instance, revealed: boolean): void {
    wrap.clear();
    wrap.addChild(icon({ provider: "bi", name: revealed ? "eye" : "eye-slash", context: null, meta: null }));
}

function flipSecretReveal(refs: { preEl: Instance; iconWrap: Instance; btn: Instance }, revealed: boolean): void {
    refs.preEl.el.classList.toggle(GLASS_CODEVIEW_PRE_BLURRED_CLASS, !revealed);
    renderRevealIcon(refs.iconWrap, revealed);
    refs.btn.setAttr("aria-label", revealed ? "hide" : "reveal");
    refs.btn.setAttr("title", revealed ? "hide" : "reveal");
}

export function buildSecretToggle(preEl: Instance, initiallyRevealed: boolean): Instance {
    let revealed = initiallyRevealed;
    if (!revealed) preEl.el.classList.add(GLASS_CODEVIEW_PRE_BLURRED_CLASS);
    const iconWrap = span(baseProps([]));
    renderRevealIcon(iconWrap, revealed);
    const btn = button(
        {
            classes: [GLASS_SECRET_TOGGLE_CLASS],
            ariaLabel: revealed ? "hide" : "reveal",
            title: revealed ? "hide" : "reveal",
            type: "button",
            context: "reveal or hide the secret value",
            meta: ["action"],
            onClick: (e) => {
                e.stopPropagation();
                revealed = !revealed;
                flipSecretReveal({ preEl, iconWrap, btn }, revealed);
            },
        },
        [iconWrap],
    );
    return btn;
}
