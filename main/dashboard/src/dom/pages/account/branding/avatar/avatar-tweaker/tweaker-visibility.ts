import type { Instance } from "../../../../../factory/index.js";
import type { BrandingController } from "../../branding-controller/index.js";

export interface TweakerVisibilityRefs {
    ctrl: BrandingController;
    labelEl: Instance;
    controls: Instance;
    canvasInst: Instance<HTMLCanvasElement>;
    bodyEl: Instance;
    revertBtn: Instance<HTMLButtonElement>;
}

export function applyTweakerVisibility(refs: TweakerVisibilityRefs): void {
    const isImage = refs.ctrl.isTweakable();
    refs.labelEl.el.hidden = !isImage;
    refs.controls.el.hidden = !isImage;
    refs.canvasInst.el.hidden = !isImage;
    refs.bodyEl.el.hidden = !isImage;
    refs.revertBtn.el.hidden = !isImage;
}
