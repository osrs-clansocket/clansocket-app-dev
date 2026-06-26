import type { Instance } from "../../../../factory/index.js";
import { hexToRgb } from "./math.js";
import { hexToHsl } from "./hsl.js";
import { setSlider } from "./sliders.js";
import type { PickerSliders, PickerState } from "./color-picker-types.js";

function syncFromHex(st: PickerState, hex: string): void {
    const hsl = hexToHsl(hex);
    const rgb = hexToRgb(hex);
    st.h = hsl.h;
    st.s = hsl.s;
    st.l = hsl.l;
    st.r = rgb.r;
    st.g = rgb.g;
    st.b = rgb.b;
}

function syncSliders(sliders: PickerSliders, st: PickerState): void {
    setSlider(sliders.hue, st.h);
    setSlider(sliders.sat, st.s);
    setSlider(sliders.lit, st.l);
    setSlider(sliders.red, st.r);
    setSlider(sliders.grn, st.g);
    setSlider(sliders.blu, st.b);
}

export function broadcastPickerHex(args: {
    hex: string;
    st: PickerState;
    sliders: PickerSliders;
    hexInput: Instance<HTMLInputElement>;
    preview: Instance;
    onChange: (h: string) => void;
}): void {
    const { hex, st, sliders, hexInput, preview, onChange } = args;
    st.broadcasting = true;
    try {
        syncFromHex(st, hex);
        syncSliders(sliders, st);
        hexInput.el.value = hex;
        preview.setAttr("style", `background: ${hex}`);
    } finally {
        st.broadcasting = false;
    }
    onChange(hex);
}
