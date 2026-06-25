import { button, div, input, wireClick, type Instance } from "../../../../factory/index.js";

const PICKER_HOST = "voxlab__picker";
const PICKER_SWATCH = "voxlab__picker-swatch";
const KEY_ESCAPE = "Escape";
const POPUP_MARGIN = 8;

export interface SwatchHandle {
    host: Instance<HTMLDivElement>;
    carrier: HTMLInputElement;
    setValue: (hex: string) => void;
}

interface SwatchInternals {
    carrier: Instance<HTMLInputElement>;
    swatchBtn: Instance<HTMLButtonElement>;
    popupRef: { v: Instance | null };
}

export function positionPopup(popupEl: HTMLElement, swatchEl: HTMLElement): void {
    const rect = swatchEl.getBoundingClientRect();
    const popupRect = popupEl.getBoundingClientRect();
    const winW = window.innerWidth;
    const winH = window.innerHeight;
    let left = rect.right + POPUP_MARGIN;
    if (left + popupRect.width > winW - POPUP_MARGIN) left = rect.left - popupRect.width - POPUP_MARGIN;
    if (left < POPUP_MARGIN) left = POPUP_MARGIN;
    let top = rect.top;
    if (top + popupRect.height > winH - POPUP_MARGIN) top = winH - popupRect.height - POPUP_MARGIN;
    if (top < POPUP_MARGIN) top = POPUP_MARGIN;
    popupEl.style.left = `${left}px`;
    popupEl.style.top = `${top}px`;
}

function buildSwatchInputs(opts: { ariaLabel: string; initial: string }): {
    carrier: Instance<HTMLInputElement>;
    swatchBtn: Instance<HTMLButtonElement>;
    host: Instance<HTMLDivElement>;
} {
    const carrier: Instance<HTMLInputElement> = input({
        type: "hidden",
        value: opts.initial,
        ariaLabel: "color value carrier",
        context: "color carrier value",
        meta: ["input"],
    });
    const swatchBtn: Instance<HTMLButtonElement> = button({
        ariaLabel: opts.ariaLabel,
        classes: [PICKER_SWATCH],
        style: `background: ${opts.initial}`,
        context: "open color picker popup",
        meta: ["action"],
    });
    const host = div({ classes: [PICKER_HOST], context: null, meta: null }, [
        swatchBtn,
        carrier,
    ]) as Instance<HTMLDivElement>;
    return { carrier, swatchBtn, host };
}

function makeSwatchClose(
    intern: SwatchInternals,
    onDocDown: (e: PointerEvent) => void,
    onKey: (e: KeyboardEvent) => void,
): () => void {
    return () => {
        intern.popupRef.v?.destroy();
        intern.popupRef.v = null;
        document.removeEventListener("pointerdown", onDocDown, true);
        document.removeEventListener("keydown", onKey);
    };
}

function makeSwatchOpen(deps: {
    intern: SwatchInternals;
    close: () => void;
    onDocDown: (e: PointerEvent) => void;
    onKey: (e: KeyboardEvent) => void;
    setValue: (hex: string) => void;
    buildPickerPopup: (initial: string, onChange: (hex: string) => void) => Instance<HTMLDivElement>;
}): () => void {
    const { intern, close, onDocDown, onKey, setValue, buildPickerPopup } = deps;
    return () => {
        if (intern.popupRef.v) {
            close();
            return;
        }
        const popup = buildPickerPopup(intern.carrier.el.value, setValue);
        intern.popupRef.v = popup;
        popup.mount(document.body);
        positionPopup(popup.el, intern.swatchBtn.el);
        setTimeout(() => {
            document.addEventListener("pointerdown", onDocDown, true);
            document.addEventListener("keydown", onKey);
        }, 0);
    };
}

export function buildColorSwatch(
    opts: { ariaLabel: string; initial: string },
    buildPickerPopup: (initial: string, onChange: (hex: string) => void) => Instance<HTMLDivElement>,
): SwatchHandle {
    const { carrier, swatchBtn, host } = buildSwatchInputs(opts);
    const intern: SwatchInternals = { carrier, swatchBtn, popupRef: { v: null } };
    const setValue = (hex: string): void => {
        carrier.el.value = hex;
        swatchBtn.setAttr("style", `background: ${hex}`);
        carrier.el.dispatchEvent(new Event("input", { bubbles: true }));
    };
    const onDocDown = (e: PointerEvent): void => {
        const p = intern.popupRef.v;
        if (!p) return;
        if (!p.el.contains(e.target as Node) && e.target !== swatchBtn.el) close();
    };
    const onKey = (e: KeyboardEvent): void => {
        if (e.key === KEY_ESCAPE) close();
    };
    const close = makeSwatchClose(intern, onDocDown, onKey);
    wireClick(swatchBtn.el, makeSwatchOpen({ intern, close, onDocDown, onKey, setValue, buildPickerPopup }));
    return { host, setValue, carrier: carrier.el };
}
