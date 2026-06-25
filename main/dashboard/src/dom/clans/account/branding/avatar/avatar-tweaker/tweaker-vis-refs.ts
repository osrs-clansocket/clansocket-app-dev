import type { BrandingController } from "../../branding-controller/index.js";
import type { TweakerVisibilityRefs } from "./tweaker-visibility.js";
import type { TweakerKit } from "./tweaker-kit-types.js";

export function buildVisRefs(ctrl: BrandingController, kit: TweakerKit): TweakerVisibilityRefs {
    return {
        ctrl,
        labelEl: kit.labelEl,
        controls: kit.controls,
        canvasInst: kit.canvasInst,
        voxlabHost: kit.voxlabHost,
        bodyEl: kit.bodyEl,
        revertBtn: kit.actions.revertBtn,
        voxlabBtn: kit.actions.voxlabBtn,
    };
}
