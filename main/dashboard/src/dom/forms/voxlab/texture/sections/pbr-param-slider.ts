import { createSliderInput } from "../../../../../voxlab/formatters/control-formatter.js";

export interface ParamSliderArgs {
    label: string;
    min: number;
    max: number;
    step: number;
    value: number;
    format: (n: number) => string;
    apply: (v: number) => void;
    onChange: () => void;
}

export function buildParamSlider(args: ParamSliderArgs): ReturnType<typeof createSliderInput> {
    const s = createSliderInput({
        label: args.label,
        min: args.min,
        max: args.max,
        step: args.step,
        value: args.value,
        formatValue: args.format,
    });
    s.input.addEventListener("input", () => {
        args.apply(Number.parseFloat(s.input.value));
        args.onChange();
    });
    return s;
}
