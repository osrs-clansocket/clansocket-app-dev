import { div, type Instance, baseProps } from "../../../../../factory/index.js";
import {
    TWEAKER_ACTIONS_CLASS,
    TWEAKER_ACTIONS_PAIR_CLASS,
    TWEAKER_CANVAS_STACK_CLASS,
} from "../../../../../../shared/constants/branding-tweaker-constants.js";

export function buildTweakerStack(canvasInst: Instance, hiddenSource: Instance): Instance {
    const canvasStack = div(baseProps([TWEAKER_CANVAS_STACK_CLASS]), [canvasInst, hiddenSource]);
    canvasStack.el.style.overflow = "hidden";
    canvasStack.el.style.position = "relative";
    return canvasStack;
}

export function buildTweakerRow(args: { uploadBtn: Instance; revertBtn: Instance; removeHost: Instance }): Instance {
    const { uploadBtn, revertBtn, removeHost } = args;
    return div(baseProps([TWEAKER_ACTIONS_CLASS]), [
        div(baseProps([TWEAKER_ACTIONS_PAIR_CLASS]), [revertBtn, removeHost]),
        div(baseProps([TWEAKER_ACTIONS_PAIR_CLASS]), [uploadBtn]),
    ]);
}
