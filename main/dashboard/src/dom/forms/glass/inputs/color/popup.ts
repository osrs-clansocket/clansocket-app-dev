import { div, label, wireInput, type Instance } from "../../../../factory/index.js";
import { hexToHsl, hexToRgb, normalizeHex } from "./math.js";
import type { PickerSliders, PickerState } from "./color-picker-types.js";
import { broadcastPickerHex } from "./color-picker-broadcast.js";
import { makePickerSliders } from "./color-picker-sliders.js";
import { buildHexInput, buildPickerColumns } from "./color-picker-columns.js";

const PICKER_LABEL = "voxlab__picker-label";
const PICKER_POPUP = "voxlab__picker-popup";
const PICKER_POPUP_WIDE = "voxlab__picker-popup--wide";
const PICKER_PREVIEW = "voxlab__picker-popup-preview";
const PICKER_COLUMNS = "voxlab__picker-popup-columns";
const PICKER_HEX_ROW = "voxlab__picker-popup-hex";

export function buildPickerPopup(initial: string, onChange: (hex: string) => void): Instance<HTMLDivElement> {
    const preview = div({ classes: [PICKER_PREVIEW], style: `background: ${initial}`, context: null, meta: null });
    const st: PickerState = { ...hexToHsl(initial), ...hexToRgb(initial), broadcasting: false };
    const slidersRef: { v: PickerSliders | null } = { v: null };
    const hexInput = buildHexInput(initial);
    const broadcast = (hex: string): void => {
        if (slidersRef.v) broadcastPickerHex({ hex, st, hexInput, preview, onChange, sliders: slidersRef.v });
    };
    slidersRef.v = makePickerSliders(st, broadcast);
    const { hslCol, rgbCol } = buildPickerColumns(slidersRef.v);
    const hexRow = div({ classes: [PICKER_HEX_ROW], context: null, meta: null }, [
        label({ classes: [PICKER_LABEL], context: null, meta: null }, ["Hex"]),
        hexInput,
    ]);
    wireInput(hexInput.el, () => {
        if (st.broadcasting) return;
        const hex = normalizeHex(hexInput.el.value);
        if (hex) broadcast(hex);
    });
    return div({ classes: [PICKER_POPUP, PICKER_POPUP_WIDE], context: null, meta: null }, [
        preview,
        div({ classes: [PICKER_COLUMNS], context: null, meta: null }, [hslCol, rgbCol]),
        hexRow,
    ]) as Instance<HTMLDivElement>;
}
