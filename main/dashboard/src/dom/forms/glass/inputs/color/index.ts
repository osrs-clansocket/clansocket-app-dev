import "../../../../../styles/components/forms/picker-component.css";
import { div, effect, label, type Instance, baseProps } from "../../../../factory/index.js";
import { buildColorSwatch } from "./swatch.js";
import { buildPickerPopup } from "./popup.js";

const CTRL_WRAPPER = "picker__control";
const CTRL_COLOR = "picker__control--color";
const PICKER_LABEL = "picker__label";

export interface ColorPickerHandle {
    wrapper: HTMLElement;
    input: HTMLInputElement;
}

export interface GlassColorOptions {
    name: string;
    value: () => string;
    ariaLabel?: string;
    onChange?: (next: string) => void;
}

export function createColorPicker(labelText: string, initial: string): ColorPickerHandle {
    const swatch = buildColorSwatch({ ariaLabel: `${labelText}: open color picker`, initial }, buildPickerPopup);
    const wrapper = div(baseProps([CTRL_WRAPPER, CTRL_COLOR]), [
        label(baseProps([PICKER_LABEL]), [labelText]),
        swatch.host,
    ]);
    return { wrapper: wrapper.el, input: swatch.carrier };
}

export function buildGlassColor(opts: GlassColorOptions): Instance<HTMLDivElement> {
    const { value, ariaLabel, name, onChange } = opts;
    const ariaText = ariaLabel ?? name;
    const swatch = buildColorSwatch(
        { ariaLabel: `${ariaText}: open color picker`, initial: value() },
        buildPickerPopup,
    );
    if (onChange) swatch.carrier.addEventListener("input", () => onChange(swatch.carrier.value));
    swatch.host.trackDispose(
        effect(() => {
            const next = value();
            if (swatch.carrier.value !== next) swatch.setValue(next);
        }),
    );
    return swatch.host;
}
