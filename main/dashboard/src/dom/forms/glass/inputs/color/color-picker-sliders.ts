import { BYTE_MAX, HUE_MAX, PCT_MAX, rgbToHex } from "./math.js";
import { hslToHex } from "./hsl.js";
import { makeSlider, type SliderHandle } from "./sliders.js";
import type { PickerSliders, PickerState } from "./color-picker-types.js";

function makePickerHsl(
    st: PickerState,
    pushFromHsl: () => void,
): { hue: SliderHandle; sat: SliderHandle; lit: SliderHandle } {
    return {
        hue: makeSlider(0, HUE_MAX, st.h, (v) => {
            if (st.broadcasting) return;
            st.h = v;
            pushFromHsl();
        }),
        sat: makeSlider(0, PCT_MAX, st.s, (v) => {
            if (st.broadcasting) return;
            st.s = v;
            pushFromHsl();
        }),
        lit: makeSlider(0, PCT_MAX, st.l, (v) => {
            if (st.broadcasting) return;
            st.l = v;
            pushFromHsl();
        }),
    };
}

export function makePickerSliders(st: PickerState, broadcast: (hex: string) => void): PickerSliders {
    const pushFromHsl = (): void => broadcast(hslToHex(st.h, st.s, st.l));
    const pushFromRgb = (): void => broadcast(rgbToHex(st.r, st.g, st.b));
    return {
        ...makePickerHsl(st, pushFromHsl),
        red: makeSlider(0, BYTE_MAX, st.r, (v) => {
            if (st.broadcasting) return;
            st.r = v;
            pushFromRgb();
        }),
        grn: makeSlider(0, BYTE_MAX, st.g, (v) => {
            if (st.broadcasting) return;
            st.g = v;
            pushFromRgb();
        }),
        blu: makeSlider(0, BYTE_MAX, st.b, (v) => {
            if (st.broadcasting) return;
            st.b = v;
            pushFromRgb();
        }),
    };
}
