import { div, span, type Instance, baseProps, textProps } from "../../../../../factory/index.js";
import type { BrandingController } from "../../branding-controller/index.js";
import { wireDragPan } from "./drag.js";
import { createSliderSpecs } from "./sliders.js";
import { buildTweakerActions } from "./index-actions.js";
import { buildTweakerCanvas } from "./index-canvas.js";
import { FORM_FIELD_LABEL } from "../../../../../forms/form-classes.js";
import {
    TWEAKER_BLOCK_CLASS,
    TWEAKER_BODY_CLASS,
    TWEAKER_STATUS_CLASS,
} from "../../../../../../shared/constants/branding-tweaker-constants.js";
import { buildTweakerControls } from "./tweaker-controls.js";
import { buildTweakerStack } from "./tweaker-layout.js";
import type { TweakerKit } from "./tweaker-kit-types.js";

export type { TweakerKit } from "./tweaker-kit-types.js";
export { buildVisRefs } from "./tweaker-vis-refs.js";

function buildHeader(ctrl: BrandingController): { labelEl: Instance<HTMLElement>; statusEl: Instance<HTMLElement> } {
    const labelEl = span(textProps([FORM_FIELD_LABEL], "Tweak"));
    labelEl.el.hidden = !ctrl.isTweakable();
    const statusEl = span(textProps([TWEAKER_STATUS_CLASS], ""));
    return { labelEl, statusEl };
}

function buildBody(
    ctrl: BrandingController,
    statusEl: Instance,
    canvas: ReturnType<typeof buildTweakerCanvas>,
): { controls: Instance; bodyEl: Instance; sliders: ReturnType<typeof createSliderSpecs> } {
    const sliders = createSliderSpecs(ctrl, canvas.render);
    wireDragPan(canvas.canvasInst, ctrl, canvas.render);
    const controls = buildTweakerControls(sliders, statusEl);
    const bodyEl = div(baseProps([TWEAKER_BODY_CLASS]), [
        controls,
        buildTweakerStack(canvas.canvasInst, canvas.hiddenSource),
    ]);
    return { controls, bodyEl, sliders };
}

export function assembleTweaker(ctrl: BrandingController): TweakerKit {
    const block = div(baseProps([TWEAKER_BLOCK_CLASS]));
    const { labelEl, statusEl } = buildHeader(ctrl);
    const canvas = buildTweakerCanvas(ctrl);
    const actions = buildTweakerActions(ctrl);
    const { controls, bodyEl, sliders } = buildBody(ctrl, statusEl, canvas);
    return {
        block,
        labelEl,
        statusEl,
        bodyEl,
        controls,
        sliders,
        actions,
        canvasInst: canvas.canvasInst,
        render: canvas.render,
        refreshSource: canvas.refreshSource,
    };
}
