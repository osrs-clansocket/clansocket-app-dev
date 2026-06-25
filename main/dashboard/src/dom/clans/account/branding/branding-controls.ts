import { BTN_VARIANT_OUTLINE, button, div, paragraph, type Instance } from "../../../factory";
import type { ManagedClan } from "../../../../state/clans/clans-client/index.js";
import { BrandingController } from "./branding-controller";
import { buildAvatarUpload } from "./avatar/avatar-upload.js";
import { buildAvatarTweaker } from "./avatar/avatar-tweaker/index.js";
import { buildColorPicker } from "./pickers/color-picker.js";
import { buildIconPicker } from "./pickers/icon-picker.js";
import { isRasterProvider, resolveIcon } from "../../../../icons/providers.js";
import { router } from "../../../../managers/router/index.js";
import {
    ACCOUNT_BRANDING_CLASS,
    ACCOUNT_BRANDING_ROW_CLASS,
    ACCOUNT_EMPTY_CLASS,
    ACCOUNT_INSTRUCTIONS_CLASS,
} from "../../../../shared/constants/account-constants.js";

function buildVoxlabUrl(ctrl: BrandingController): string {
    const params = new URLSearchParams();
    if (ctrl.kind !== null) params.set("kind", ctrl.kind);
    if (ctrl.value !== null) params.set("value", ctrl.value);
    const query = params.toString();
    const querySuffix = query.length > 0 ? `?${query}` : "";
    return `/clans/${ctrl.clan.slug}/voxlab${querySuffix}`;
}

function syncIconView(ctrl: BrandingController, tweakerBlock: Instance, avatarBlock: Instance): void {
    const isImage = ctrl.isTweakable();
    const hasIconToActOn = isImage || ctrl.kind === "voxlab";
    tweakerBlock.el.hidden = !hasIconToActOn;
    avatarBlock.el.hidden = hasIconToActOn;
}

function shouldHideBtn(ctrl: BrandingController): boolean {
    const tweakerVisible = ctrl.isTweakable() || ctrl.kind === "voxlab";
    const isIcoImage = ctrl.kind === "image" && ctrl.value === "ico";
    const isRasterBuiltin =
        ctrl.kind === "builtin" && ctrl.value !== null && isRasterProvider(resolveIcon(ctrl.value).provider);
    return tweakerVisible || ctrl.kind === null || isIcoImage || isRasterBuiltin;
}

function syncBrandingView(
    ctrl: BrandingController,
    tweakerBlock: Instance,
    avatarBlock: Instance,
    editVoxlabBtn: Instance<HTMLButtonElement>,
): void {
    syncIconView(ctrl, tweakerBlock, avatarBlock);
    const shouldHide = shouldHideBtn(ctrl);
    editVoxlabBtn.el.hidden = shouldHide;
    editVoxlabBtn.el.style.display = shouldHide ? "none" : "";
}

function buildEditBtn(ctrl: BrandingController): Instance<HTMLButtonElement> {
    const btn: Instance<HTMLButtonElement> = button({
        variant: BTN_VARIANT_OUTLINE,
        compact: true,
        text: "Edit in Voxlab",
        context: "open the voxlab editor for the current icon",
        meta: ["action", "clan"],
        onClick: () => router.navigate(buildVoxlabUrl(ctrl)),
    });
    btn.el.hidden = ctrl.kind === null;
    return btn;
}

function brandingInstructionsParagraph(): Instance {
    return paragraph({
        classes: [ACCOUNT_INSTRUCTIONS_CLASS],
        text: "Pick an icon, set a color, or upload a custom image (.ico/.png/.svg/.webp/.jpg ≤ 10 MB).",
        context: null,
        meta: null,
    });
}

export function buildBrandingControls(clan: ManagedClan): Instance {
    const ctrl = new BrandingController(clan);
    const status = paragraph({ classes: [ACCOUNT_EMPTY_CLASS], text: "", context: null, meta: null });
    ctrl.statusEl = status;
    const { search, grid: iconGrid } = buildIconPicker(ctrl);
    const colorBlock = buildColorPicker(ctrl);
    const avatarBlock = buildAvatarUpload(ctrl);
    const tweakerBlock = buildAvatarTweaker(ctrl);
    const editVoxlabBtn = buildEditBtn(ctrl);
    const sync = (): void => syncBrandingView(ctrl, tweakerBlock, avatarBlock, editVoxlabBtn);
    ctrl.subscribe({ onIconStateChange: sync });
    sync();
    return div({ classes: [ACCOUNT_BRANDING_CLASS], context: null, meta: null }, [
        brandingInstructionsParagraph(),
        search,
        iconGrid,
        editVoxlabBtn,
        div({ classes: [ACCOUNT_BRANDING_ROW_CLASS], context: null, meta: null }, [
            colorBlock,
            avatarBlock,
            tweakerBlock,
        ]),
        status,
    ]);
}
