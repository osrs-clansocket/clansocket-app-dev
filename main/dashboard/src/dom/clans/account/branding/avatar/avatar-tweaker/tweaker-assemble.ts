import { div, span, type Instance } from "../../../../../factory/index.js";
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
import { buildTweakerHost } from "./tweaker-host.js";
import { buildTweakerStack } from "./tweaker-layout.js";
import type { TweakerKit } from "./tweaker-kit-types.js";

export type { TweakerKit } from "./tweaker-kit-types.js";
export { buildVisRefs } from "./tweaker-vis-refs.js";

function buildHeader(ctrl: BrandingController): { labelEl: Instance<HTMLElement>; statusEl: Instance<HTMLElement> } {
    const labelEl = span({ classes: [FORM_FIELD_LABEL], text: "Tweak", context: null, meta: null });
    labelEl.el.hidden = !ctrl.isTweakable();
    const statusEl = span({ classes: [TWEAKER_STATUS_CLASS], text: "", context: null, meta: null });
    return { labelEl, statusEl };
}

function buildBody(
    ctrl: BrandingController,
    statusEl: Instance,
    canvas: ReturnType<typeof buildTweakerCanvas>,
): { voxlabHost: Instance; controls: Instance; bodyEl: Instance; sliders: ReturnType<typeof createSliderSpecs> } {
    const sliders = createSliderSpecs(ctrl, canvas.render);
    wireDragPan(canvas.canvasInst, ctrl, canvas.render);
    const controls = buildTweakerControls(sliders, statusEl);
    const voxlabHost = buildTweakerHost(ctrl);
    const bodyEl = div({ classes: [TWEAKER_BODY_CLASS], context: null, meta: null }, [
        controls,
        buildTweakerStack(canvas.canvasInst, voxlabHost, canvas.hiddenSource),
    ]);
    return { voxlabHost, controls, bodyEl, sliders };
}

export function assembleTweaker(ctrl: BrandingController): TweakerKit {
    const block = div({ classes: [TWEAKER_BLOCK_CLASS], context: null, meta: null });
    const { labelEl, statusEl } = buildHeader(ctrl);
    const canvas = buildTweakerCanvas(ctrl);
    const actions = buildTweakerActions(ctrl);
    const { voxlabHost, controls, bodyEl, sliders } = buildBody(ctrl, statusEl, canvas);
    return {
        block,
        labelEl,
        statusEl,
        bodyEl,
        voxlabHost,
        controls,
        sliders,
        actions,
        canvasInst: canvas.canvasInst,
        render: canvas.render,
        refreshSource: canvas.refreshSource,
    };
}
