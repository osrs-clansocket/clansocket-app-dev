import { div, input, label, span, type Instance, baseProps, textProps } from "../../../../factory/index.js";

const PICKER_LABEL = "picker__label";
const PICKER_ROW = "picker__popup-row";
const PICKER_VALUE = "picker__popup-value";
const PICKER_SLIDER = "picker__control-slider";

export interface SliderHandle {
    input: Instance<HTMLInputElement>;
    valueEl: Instance<HTMLSpanElement>;
}

export function setSlider(slot: SliderHandle, value: number): void {
    const rounded = Math.round(value);
    slot.input.el.value = String(rounded);
    slot.valueEl.setText(String(rounded));
}

interface SliderInputArgs {
    min: number;
    max: number;
    rounded: number;
    valueEl: Instance<HTMLSpanElement>;
    onInput: (v: number) => void;
}

function buildSliderInput(a: SliderInputArgs): Instance<HTMLInputElement> {
    return input({
        type: "range",
        classes: [PICKER_SLIDER],
        min: String(a.min),
        max: String(a.max),
        step: "1",
        value: String(a.rounded),
        ariaLabel: "color channel slider",
        context: "adjust color channel value",
        meta: ["input"],
        onInput: (e) => {
            const target = e.target as HTMLInputElement;
            const v = Number.parseInt(target.value, 10);
            a.valueEl.setText(String(v));
            a.onInput(v);
        },
    });
}

export function makeSlider(min: number, max: number, value: number, onInput: (v: number) => void): SliderHandle {
    const rounded = Math.round(value);
    const valueEl = span(textProps([PICKER_VALUE], String(rounded))) as Instance<HTMLSpanElement>;
    return { input: buildSliderInput({ min, max, rounded, valueEl, onInput }), valueEl };
}

export function sliderRow(labelText: string, handle: SliderHandle): Instance<HTMLDivElement> {
    return div(baseProps([PICKER_ROW]), [
        label(baseProps([PICKER_LABEL]), [labelText]),
        handle.input,
        handle.valueEl,
    ]) as Instance<HTMLDivElement>;
}
