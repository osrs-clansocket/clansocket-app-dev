import { div, input, label, span } from "../../dom/factory/index.js";
import { createColorPicker } from "../../dom/forms/glass/inputs/color/index.js";
import { CONTROL_TOGGLE_INPUT_CLASS } from "../../shared/constants/voxlab/voxlab-classes-constants.js";

const CLS_CONTROL = "voxlab__control";
const CLS_NUMBER = "voxlab__control--number";
const CLS_SLIDER = "voxlab__control--slider";
const CLS_SLIDER_INPUT = "voxlab__control-slider";
const CLS_TOGGLE = "voxlab__control--toggle";
const CLS_TOGGLE_LABEL = "voxlab__control-toggle";
const CLS_VALUE = "voxlab__control-value";
const CLS_LABEL = "voxlab__control-label";

const FRACTION_DIGITS = 2;

export interface ControlPair<E extends HTMLElement> {
    wrapper: HTMLElement;
    input: E;
    valueLabel?: HTMLSpanElement;
}

export interface NumberInputConfig {
    label: string;
    min: number;
    max: number;
    step: number;
    value: number;
}

export interface SliderInputConfig {
    label: string;
    min: number;
    max: number;
    step: number;
    value: number;
    formatValue?: (n: number) => string;
}

export interface ToggleInputConfig {
    label: string;
    checked: boolean;
}

export interface ColorInputConfig {
    label: string;
    value: string;
}

export function createNumberInput(config: NumberInputConfig): ControlPair<HTMLInputElement> {
    const numInput = input({
        type: "number",
        min: String(config.min),
        max: String(config.max),
        step: String(config.step),
        value: String(config.value),
        ariaLabel: config.label,
        context: `edit numeric value: ${config.label}`,
        meta: ["input"],
    });
    const wrapper = div({ classes: [CLS_CONTROL, CLS_NUMBER], context: null, meta: null }, [
        label({ classes: [CLS_LABEL], context: null, meta: null }, [config.label]),
        numInput,
    ]);
    return { wrapper: wrapper.el, input: numInput.el };
}

export function createSliderInput(config: SliderInputConfig): ControlPair<HTMLInputElement> {
    const format = config.formatValue ?? ((n: number): string => n.toFixed(FRACTION_DIGITS));
    const valueSpan = span({ classes: [CLS_VALUE], text: format(config.value), context: null, meta: null });
    const sliderInput = input({
        type: "range",
        classes: [CLS_SLIDER_INPUT],
        min: String(config.min),
        max: String(config.max),
        step: String(config.step),
        value: String(config.value),
        ariaLabel: config.label,
        context: `adjust slider: ${config.label}`,
        meta: ["input"],
        onInput: (e) => {
            const target = e.target as HTMLInputElement;
            valueSpan.setText(format(Number.parseFloat(target.value)));
        },
    });
    const wrapper = div({ classes: [CLS_CONTROL, CLS_SLIDER], context: null, meta: null }, [
        label({ classes: [CLS_LABEL], context: null, meta: null }, [config.label]),
        sliderInput,
        valueSpan,
    ]);
    return { wrapper: wrapper.el, input: sliderInput.el, valueLabel: valueSpan.el as HTMLSpanElement };
}

export function createToggleInput(config: ToggleInputConfig): ControlPair<HTMLInputElement> {
    const checkInput = input({
        type: "checkbox",
        classes: [CONTROL_TOGGLE_INPUT_CLASS],
        ariaLabel: config.label,
        context: `toggle: ${config.label}`,
        meta: ["input"],
    });
    checkInput.el.checked = config.checked;
    const toggleLabel = label({ classes: [CLS_TOGGLE_LABEL], context: null, meta: null }, [
        checkInput,
        ` ${config.label}`,
    ]);
    const wrapper = div({ classes: [CLS_CONTROL, CLS_TOGGLE], context: null, meta: null }, [toggleLabel]);
    return { wrapper: wrapper.el, input: checkInput.el };
}

export function createColorInput(config: ColorInputConfig): ControlPair<HTMLInputElement> {
    const handle = createColorPicker(config.label, config.value);
    return { wrapper: handle.wrapper, input: handle.input };
}
