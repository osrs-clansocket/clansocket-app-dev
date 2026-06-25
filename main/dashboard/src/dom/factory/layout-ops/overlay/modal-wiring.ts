import type { div } from "../structural/container.js";
import type { Instance } from "../../core/index.js";
import type { ModalProps } from "./modal-types.js";

const OPEN_DELAY_MS = 10;
const CLOSE_DELAY_MS = 200;
const EVT_CLICK = "click";
const EVT_KEYDOWN = "keydown";
const KEY_ESCAPE = "Escape";

export interface ModalDismissArgs {
    overlay: ReturnType<typeof div>;
    props: ModalProps;
    getOnKey: () => (e: KeyboardEvent) => void;
    previousFocus: HTMLElement | null;
    restoreFocus: boolean;
}

export function buildModalDismiss(args: ModalDismissArgs): () => void {
    const { overlay, props, getOnKey, previousFocus, restoreFocus } = args;
    let dismissed = false;
    return (): void => {
        if (dismissed) return;
        dismissed = true;
        overlay.el.classList.remove(props.openClass);
        document.removeEventListener(EVT_KEYDOWN, getOnKey());
        window.setTimeout(() => {
            overlay.destroy();
            if (restoreFocus && previousFocus !== null) previousFocus.focus();
        }, CLOSE_DELAY_MS);
    };
}

export function buildOpenFn(
    overlay: ReturnType<typeof div>,
    props: ModalProps,
    onKey: (e: KeyboardEvent) => void,
): () => void {
    return (): void => {
        document.addEventListener(EVT_KEYDOWN, onKey);
        window.setTimeout(() => {
            overlay.el.classList.add(props.openClass);
            const target = props.initialFocus?.() ?? null;
            if (target !== null) target.focus();
        }, OPEN_DELAY_MS);
    };
}

export function wireModalDismiss(
    overlay: Instance,
    props: ModalProps,
    dismiss: () => void,
): (e: KeyboardEvent) => void {
    if (props.closeOnBackdrop !== false) {
        overlay.el.addEventListener(EVT_CLICK, (e) => {
            if (e.target !== overlay.el) return;
            props.onClose?.();
            dismiss();
        });
    }
    return (e: KeyboardEvent): void => {
        if (props.closeOnEscape !== false && e.key === KEY_ESCAPE) {
            e.preventDefault();
            props.onClose?.();
            dismiss();
        }
    };
}
