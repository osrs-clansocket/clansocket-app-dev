import { button, type Instance } from "../../../factory/index.js";
import { createNumberInput } from "../../../../voxlab/formatters/control-formatter.js";
import {
    DEFAULT_FPS,
    DEFAULT_HEIGHT,
    DEFAULT_WIDTH,
    MAX_DIMENSION,
    MAX_FPS,
    MIN_DIMENSION,
    MIN_FPS,
    STEP_DIM,
    STEP_FPS,
} from "./export-panel-types.js";

const CLS_BTN_PRIMARY = "voxlab__dropdown-btn-primary";

export interface ExportInputs {
    width: ReturnType<typeof createNumberInput>;
    height: ReturnType<typeof createNumberInput>;
    fps: ReturnType<typeof createNumberInput>;
}

export function buildExportInputs(): ExportInputs {
    return {
        width: createNumberInput({
            label: "Width",
            min: MIN_DIMENSION,
            max: MAX_DIMENSION,
            step: STEP_DIM,
            value: DEFAULT_WIDTH,
        }),
        height: createNumberInput({
            label: "Height",
            min: MIN_DIMENSION,
            max: MAX_DIMENSION,
            step: STEP_DIM,
            value: DEFAULT_HEIGHT,
        }),
        fps: createNumberInput({ label: "FPS", min: MIN_FPS, max: MAX_FPS, step: STEP_FPS, value: DEFAULT_FPS }),
    };
}

export interface ExportButtons {
    captureBtn: Instance<HTMLButtonElement>;
    bakeBtn: Instance<HTMLButtonElement>;
}

export function buildExportButtons(): ExportButtons {
    return {
        captureBtn: button({
            classes: [CLS_BTN_PRIMARY],
            text: "Capture frame",
            context: "capture current frame as image",
            meta: ["action"],
        }),
        bakeBtn: button({
            classes: [CLS_BTN_PRIMARY],
            text: "Bake animation",
            context: "bake animation timeline to file",
            meta: ["action"],
        }),
    };
}
