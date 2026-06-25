import { button, div, type Instance } from "../../../../factory/index.js";
import { createColorInput, createSliderInput } from "../../../../../voxlab/formatters/control-formatter.js";
import type { GradientSpec } from "../../../../../shared/types/voxlab/paint/paint-types.js";

const CLS_BTN_PRIMARY = "voxlab__dropdown-btn-primary";
const POSITION_SLIDER_MIN = 0;
const POSITION_SLIDER_MAX = 1;
const POSITION_SLIDER_STEP = 0.01;
const FRACTION_DIGITS = 2;

export function cloneSpec(spec: GradientSpec): GradientSpec {
    return {
        stops: spec.stops.map((s) => ({ color: s.color, position: s.position })),
        type: spec.type,
        axis: spec.axis,
        target: spec.target,
    };
}

interface StopRowArgs {
    settings: GradientSpec;
    index: number;
    onEmit: () => void;
    onRemove: () => void;
}

function buildRemoveBtn(index: number, onRemove: () => void): Instance {
    return button({
        classes: [CLS_BTN_PRIMARY],
        text: `Remove stop ${index + 1}`,
        ariaLabel: `Remove stop ${index + 1}`,
        onClick: onRemove,
        context: `remove gradient stop ${index + 1}`,
        meta: ["action", "destructive"],
    });
}

function buildStopColor(args: StopRowArgs): ReturnType<typeof createColorInput> {
    const { settings, index, onEmit } = args;
    const colorPicker = createColorInput({ label: `Stop ${index + 1} color`, value: settings.stops[index].color });
    colorPicker.input.addEventListener("input", () => {
        settings.stops[index].color = colorPicker.input.value;
        onEmit();
    });
    return colorPicker;
}

function buildStopPosition(args: StopRowArgs): ReturnType<typeof createSliderInput> {
    const { settings, index, onEmit } = args;
    const positionSlider = createSliderInput({
        label: `Stop ${index + 1} position`,
        min: POSITION_SLIDER_MIN,
        max: POSITION_SLIDER_MAX,
        step: POSITION_SLIDER_STEP,
        value: settings.stops[index].position,
        formatValue: (n) => n.toFixed(FRACTION_DIGITS),
    });
    positionSlider.input.addEventListener("input", () => {
        settings.stops[index].position = Number.parseFloat(positionSlider.input.value);
        onEmit();
    });
    return positionSlider;
}

export function buildStopRow(args: StopRowArgs): Instance {
    const colorPicker = buildStopColor(args);
    const positionSlider = buildStopPosition(args);
    return div({ context: null, meta: null }, [
        colorPicker.wrapper,
        positionSlider.wrapper,
        buildRemoveBtn(args.index, args.onRemove),
    ]);
}
