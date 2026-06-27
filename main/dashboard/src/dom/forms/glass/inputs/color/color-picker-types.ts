import type { SliderHandle } from "./sliders.js";

export interface PickerState {
    h: number;
    s: number;
    l: number;
    r: number;
    g: number;
    b: number;
    a: number;
    broadcasting: boolean;
}

export interface PickerSliders {
    hue: SliderHandle;
    sat: SliderHandle;
    lit: SliderHandle;
    red: SliderHandle;
    grn: SliderHandle;
    blu: SliderHandle;
    alpha: SliderHandle;
}
