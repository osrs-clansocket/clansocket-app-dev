import type { Instance } from "../../../../../factory/index.js";
import type { createSliderSpecs } from "./sliders.js";
import type { buildTweakerActions } from "./index-actions.js";
import type { buildTweakerCanvas } from "./index-canvas.js";

type CanvasInst = ReturnType<typeof buildTweakerCanvas>["canvasInst"];

export interface TweakerKit {
    block: Instance;
    labelEl: Instance;
    statusEl: Instance;
    bodyEl: Instance;
    canvasInst: CanvasInst;
    controls: Instance;
    sliders: ReturnType<typeof createSliderSpecs>;
    render: () => void;
    refreshSource: () => void;
    actions: ReturnType<typeof buildTweakerActions>;
}
