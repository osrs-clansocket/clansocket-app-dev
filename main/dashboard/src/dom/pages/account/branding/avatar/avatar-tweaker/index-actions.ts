import {
    BTN_VARIANT_OUTLINE,
    button,
    div,
    INLINE_CONFIRM_HOST_CLASS,
    inlineConfirm,
    type Instance,
    baseProps,
} from "../../../../../factory/index.js";
import type { BrandingController } from "../../branding-controller/index.js";
import { ACCOUNT_REMOVE_BTN_CLASS } from "../../../../../../shared/constants/account-constants.js";
import {
    TWEAKER_ACTION_CLASS,
    TWEAKER_ACTION_UPLOAD_CLASS,
} from "../../../../../../shared/constants/branding-tweaker-constants.js";

export interface TweakerActionKit {
    uploadBtn: Instance<HTMLButtonElement>;
    revertBtn: Instance<HTMLButtonElement>;
    removeHost: Instance;
}

async function withDisable(btn: Instance<HTMLButtonElement>, fn: () => Promise<void>): Promise<void> {
    btn.el.disabled = true;
    try {
        await fn();
    } finally {
        btn.el.disabled = false;
    }
}

function buildRemoveBtn(ctrl: BrandingController, removeHost: Instance): Instance<HTMLButtonElement> {
    const removeBtn: Instance<HTMLButtonElement> = button({
        variant: BTN_VARIANT_OUTLINE,

        classes: [TWEAKER_ACTION_CLASS, ACCOUNT_REMOVE_BTN_CLASS],
        text: "Remove icon",
        context: "remove the clan avatar icon",
        meta: ["destructive", "clan"],
        onClick: async () => {
            const confirmed = await inlineConfirm(removeHost, {
                cancelLabel: "Cancel",
                confirmLabel: "Remove",
                danger: true,
                cancelContext: "keep the current clan avatar icon",
                confirmContext: "confirm removing the clan avatar icon",
            });
            if (!confirmed) return;
            await withDisable(removeBtn, () => ctrl.persist(null, null));
        },
    });
    return removeBtn;
}

function buildUploadBtn(ctrl: BrandingController): Instance<HTMLButtonElement> {
    return button({
        variant: BTN_VARIANT_OUTLINE,

        classes: [TWEAKER_ACTION_CLASS],
        text: "Upload",
        context: "upload a new clan avatar image",
        meta: ["action", "clan"],
        onClick: () => ctrl.triggerUpload(),
    });
}

function buildRevertBtn(ctrl: BrandingController): Instance<HTMLButtonElement> {
    const revertBtn: Instance<HTMLButtonElement> = button({
        variant: BTN_VARIANT_OUTLINE,

        classes: [TWEAKER_ACTION_CLASS],
        text: "Revert tweaks",
        context: "revert avatar tweaks to the last saved transform",
        meta: ["action", "clan"],
        onClick: () => withDisable(revertBtn, () => ctrl.revertTweaks()),
    });
    return revertBtn;
}

export function buildTweakerActions(ctrl: BrandingController): TweakerActionKit {
    const uploadBtn = buildUploadBtn(ctrl);
    const revertBtn = buildRevertBtn(ctrl);
    const removeHost = div(baseProps([INLINE_CONFIRM_HOST_CLASS]));
    removeHost.addChild(buildRemoveBtn(ctrl, removeHost));
    revertBtn.el.hidden = !ctrl.isTweakable();
    uploadBtn.toggleClass(TWEAKER_ACTION_UPLOAD_CLASS, true);
    return { uploadBtn, revertBtn, removeHost };
}
