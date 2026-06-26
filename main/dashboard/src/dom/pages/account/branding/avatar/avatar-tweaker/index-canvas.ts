import { image, scratchCanvas, type Instance } from "../../../../../factory/index.js";
import type { BrandingController } from "../../branding-controller/index.js";
import { CANVAS_PX } from "./constants.js";
import { createRenderer, type PreviewState } from "./render.js";
import {
    TWEAKER_CANVAS_CLASS,
    TWEAKER_SOURCE_CLASS,
} from "../../../../../../shared/constants/branding-tweaker-constants.js";

export interface TweakerCanvasKit {
    canvasInst: Instance<HTMLCanvasElement>;
    hiddenSource: Instance<HTMLImageElement>;
    render: () => void;
    refreshSource: () => void;
}

function buildHiddenSource(ctrl: BrandingController): Instance<HTMLImageElement> {
    const hiddenSource = image({
        src: ctrl.pristineIconUrl(),
        classes: [TWEAKER_SOURCE_CLASS],
        alt: "",
        lazy: false,
        context: null,
        meta: null,
    });
    hiddenSource.el.hidden = true;
    hiddenSource.el.crossOrigin = "anonymous";
    return hiddenSource;
}

function wireHiddenEvents(args: {
    hiddenSource: Instance<HTMLImageElement>;
    previewState: PreviewState;
    render: () => void;
}): void {
    const { hiddenSource, previewState, render } = args;
    hiddenSource.el.addEventListener("load", () => {
        previewState.loaded = true;
        render();
    });
    hiddenSource.el.addEventListener("error", () => {
        previewState.loaded = false;
        render();
    });
}

export function buildTweakerCanvas(ctrl: BrandingController): TweakerCanvasKit {
    const canvasInst = scratchCanvas({
        width: CANVAS_PX,
        height: CANVAS_PX,
        classes: [TWEAKER_CANVAS_CLASS],
        context: null,
        meta: null,
    });
    const ctx = canvasInst.el.getContext("2d");
    const previewState: PreviewState = { image: null, loaded: false };
    const hiddenSource = buildHiddenSource(ctrl);
    previewState.image = hiddenSource.el;
    const render = createRenderer(ctx, canvasInst.el, ctrl, previewState);
    wireHiddenEvents({ hiddenSource, previewState, render });
    const refreshSource = (): void => {
        previewState.loaded = false;
        hiddenSource.el.src = ctrl.pristineIconUrl();
    };
    return { canvasInst, hiddenSource, render, refreshSource };
}
