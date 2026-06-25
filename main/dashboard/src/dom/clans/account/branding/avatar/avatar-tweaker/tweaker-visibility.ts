import type { Instance } from "../../../../../factory/index.js";
import type { BrandingController } from "../../branding-controller/index.js";

export interface TweakerVisibilityRefs {
    ctrl: BrandingController;
    labelEl: Instance;
    controls: Instance;
    canvasInst: Instance<HTMLCanvasElement>;
    voxlabHost: Instance;
    bodyEl: Instance;
    revertBtn: Instance<HTMLButtonElement>;
    voxlabBtn: Instance<HTMLButtonElement>;
}

export function applyTweakerVisibility(refs: TweakerVisibilityRefs): void {
    const isImage = refs.ctrl.isTweakable();
    const isVoxlab = refs.ctrl.kind === "voxlab";
    refs.labelEl.el.hidden = !isImage;
    refs.controls.el.hidden = !isImage;
    refs.canvasInst.el.hidden = !isImage;
    refs.voxlabHost.el.hidden = !isVoxlab;
    refs.bodyEl.el.hidden = !(isImage || isVoxlab);
    refs.revertBtn.el.hidden = !isImage;
    refs.voxlabBtn.el.hidden = !refs.ctrl.isVoxlabEligible();
}
