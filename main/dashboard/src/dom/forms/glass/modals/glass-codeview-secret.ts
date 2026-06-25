import { button, icon, type Instance } from "../../../factory/index.js";
import { BS_ICON_EYE_CLASS, BS_ICON_EYE_SLASH_CLASS } from "../../../../shared/constants/bootstrap-icon-constants.js";
import {
    GLASS_CODEVIEW_PRE_BLURRED_CLASS,
    GLASS_SECRET_TOGGLE_CLASS,
} from "../../../../shared/constants/glass-constants.js";

function applySecretReveal(refs: { preEl: Instance; iconEl: Instance; btn: Instance }, revealed: boolean): void {
    refs.preEl.el.classList.toggle(GLASS_CODEVIEW_PRE_BLURRED_CLASS, !revealed);
    refs.iconEl.el.classList.remove(BS_ICON_EYE_SLASH_CLASS, BS_ICON_EYE_CLASS);
    refs.iconEl.el.classList.add(revealed ? BS_ICON_EYE_CLASS : BS_ICON_EYE_SLASH_CLASS);
    refs.btn.setAttr("aria-label", revealed ? "hide" : "reveal");
    refs.btn.setAttr("title", revealed ? "hide" : "reveal");
}

export function buildSecretToggle(preEl: Instance, initiallyRevealed: boolean): Instance {
    let revealed = initiallyRevealed;
    if (!revealed) preEl.el.classList.add(GLASS_CODEVIEW_PRE_BLURRED_CLASS);
    const iconEl = icon({ name: revealed ? "eye" : "eye-slash", context: null, meta: null });
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
                applySecretReveal({ preEl, iconEl, btn }, revealed);
            },
        },
        [iconEl],
    );
    return btn;
}
