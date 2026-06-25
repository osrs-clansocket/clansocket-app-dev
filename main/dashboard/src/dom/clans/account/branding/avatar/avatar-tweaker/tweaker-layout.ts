import { div, type Instance } from "../../../../../factory/index.js";
import {
    TWEAKER_ACTIONS_CLASS,
    TWEAKER_ACTIONS_PAIR_CLASS,
    TWEAKER_CANVAS_STACK_CLASS,
} from "../../../../../../shared/constants/branding-tweaker-constants.js";

export function buildTweakerStack(canvasInst: Instance, voxlabHost: Instance, hiddenSource: Instance): Instance {
    const canvasStack = div({ classes: [TWEAKER_CANVAS_STACK_CLASS], context: null, meta: null }, [
        canvasInst,
        voxlabHost,
        hiddenSource,
    ]);
    canvasStack.el.style.overflow = "hidden";
    canvasStack.el.style.position = "relative";
    return canvasStack;
}

export function buildTweakerRow(args: {
    uploadBtn: Instance;
    revertBtn: Instance;
    removeHost: Instance;
    voxlabBtn: Instance;
}): Instance {
    const { uploadBtn, revertBtn, removeHost, voxlabBtn } = args;
    return div({ classes: [TWEAKER_ACTIONS_CLASS], context: null, meta: null }, [
        div({ classes: [TWEAKER_ACTIONS_PAIR_CLASS], context: null, meta: null }, [revertBtn, removeHost]),
        div({ classes: [TWEAKER_ACTIONS_PAIR_CLASS], context: null, meta: null }, [voxlabBtn, uploadBtn]),
    ]);
}
