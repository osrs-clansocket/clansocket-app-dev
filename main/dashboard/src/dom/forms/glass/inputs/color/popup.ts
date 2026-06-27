import { div, label, wireInput, type Instance, baseProps } from "../../../../factory/index.js";
import { hexToAlpha, hexToRgb, normalizeHex } from "./math.js";
import { hexToHsl } from "./hsl.js";
import type { PickerSliders, PickerState } from "./color-picker-types.js";
import { broadcastPickerHex } from "./color-picker-broadcast.js";
import { makePickerSliders } from "./color-picker-sliders.js";
import { buildHexInput, buildPickerColumns } from "./color-picker-columns.js";
import { sliderRow } from "./sliders.js";

const PICKER_LABEL = "picker__label";
const PICKER_POPUP = "picker__popup";
const PICKER_POPUP_WIDE = "picker__popup--wide";
const PICKER_PREVIEW = "picker__popup-preview";
const PICKER_COLUMNS = "picker__popup-columns";
const PICKER_HEX_ROW = "picker__popup-hex";
const PICKER_ALPHA_ROW = "picker__popup-alpha";

export function buildPickerPopup(initial: string, onChange: (hex: string) => void): Instance<HTMLDivElement> {
    const preview = div({ classes: [PICKER_PREVIEW], style: `background: ${initial}`, context: null, meta: null });
    const st: PickerState = {
        ...hexToHsl(initial),
        ...hexToRgb(initial),
        a: hexToAlpha(initial),
        broadcasting: false,
    };
    const slidersRef: { v: PickerSliders | null } = { v: null };
    const hexInput = buildHexInput(initial);
    const broadcast = (hex: string): void => {
        if (slidersRef.v) broadcastPickerHex({ hex, st, hexInput, preview, onChange, sliders: slidersRef.v });
    };
    slidersRef.v = makePickerSliders(st, broadcast);
    const { hslCol, rgbCol } = buildPickerColumns(slidersRef.v);
    const alphaRow = sliderRow("A", slidersRef.v.alpha);
    alphaRow.toggleClass(PICKER_ALPHA_ROW, true);
    const hexRow = div(baseProps([PICKER_HEX_ROW]), [label(baseProps([PICKER_LABEL]), ["Hex"]), hexInput]);
    wireInput(hexInput.el, () => {
        if (st.broadcasting) return;
        const hex = normalizeHex(hexInput.el.value);
        if (hex) broadcast(hex);
    });
    return div(baseProps([PICKER_POPUP, PICKER_POPUP_WIDE]), [
        preview,
        div(baseProps([PICKER_COLUMNS]), [hslCol, rgbCol]),
        alphaRow,
        hexRow,
    ]) as Instance<HTMLDivElement>;
}
