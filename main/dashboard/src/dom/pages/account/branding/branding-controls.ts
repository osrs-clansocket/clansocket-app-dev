import { div, paragraph, type Instance, baseProps, textProps } from "../../../factory";
import type { ManagedClan } from "../../../../state/clans/clans-client/index.js";
import { BrandingController } from "./branding-controller";
import { buildAvatarUpload } from "./avatar/avatar-upload.js";
import { buildAvatarTweaker } from "./avatar/avatar-tweaker/index.js";
import { buildColorPicker } from "./pickers/color-picker.js";
import { buildIconPicker } from "./pickers/icon-picker.js";
import {
    ACCOUNT_BRANDING_CLASS,
    ACCOUNT_BRANDING_ROW_CLASS,
    ACCOUNT_EMPTY_CLASS,
    ACCOUNT_INSTRUCTIONS_CLASS,
} from "../../../../shared/constants/account-constants.js";

function syncIconView(ctrl: BrandingController, tweakerBlock: Instance, avatarBlock: Instance): void {
    const isImage = ctrl.isTweakable();
    tweakerBlock.el.hidden = !isImage;
    avatarBlock.el.hidden = isImage;
}

function brandingInstructionsParagraph(): Instance {
    return paragraph(
        textProps(
            [ACCOUNT_INSTRUCTIONS_CLASS],
            "Pick an icon, set a color, or upload a custom image (.ico/.png/.svg/.webp/.jpg ≤ 10 MB).",
        ),
    );
}

export function buildBrandingControls(clan: ManagedClan): Instance {
    const ctrl = new BrandingController(clan);
    const status = paragraph(textProps([ACCOUNT_EMPTY_CLASS], ""));
    ctrl.statusEl = status;
    const { tabs: iconTabs, search, grid: iconGrid } = buildIconPicker(ctrl);
    const colorBlock = buildColorPicker(ctrl);
    const avatarBlock = buildAvatarUpload(ctrl);
    const tweakerBlock = buildAvatarTweaker(ctrl);
    const sync = (): void => syncIconView(ctrl, tweakerBlock, avatarBlock);
    ctrl.subscribe({ onIconStateChange: sync });
    sync();
    return div(baseProps([ACCOUNT_BRANDING_CLASS]), [
        brandingInstructionsParagraph(),
        iconTabs,
        search,
        iconGrid,
        div(baseProps([ACCOUNT_BRANDING_ROW_CLASS]), [colorBlock, avatarBlock, tweakerBlock]),
        status,
    ]);
}
