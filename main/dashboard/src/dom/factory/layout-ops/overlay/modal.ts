import { div } from "../structural/container.js";
import type { Child } from "../../core/index.js";
import { onceEffect } from "../../effects/once-composer.js";
import type { ModalInstance, ModalProps } from "./modal-types.js";
import { buildModalDismiss, buildOpenFn, wireModalDismiss } from "./modal-wiring.js";

const EVT_CLICK = "click";

function modal(props: ModalProps, children: readonly Child[] = []): ModalInstance {
    const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const dialog = div({ classes: props.dialogClasses ?? [], effects: onceEffect("pop") }, children);
    dialog.el.addEventListener(EVT_CLICK, (e) => e.stopPropagation());
    const overlay = div({ classes: props.overlayClasses ?? [], context: props.context, meta: props.meta }, [dialog]);
    const keyRef: { fn: (e: KeyboardEvent) => void } = { fn: () => undefined };
    const dismiss = buildModalDismiss({
        overlay,
        props,
        previousFocus,
        getOnKey: () => keyRef.fn,
        restoreFocus: props.restoreFocus !== false,
    });
    keyRef.fn = wireModalDismiss(overlay, props, dismiss);
    return Object.assign(overlay, { dismiss, open: buildOpenFn(overlay, props, keyRef.fn), dialogEl: dialog.el });
}

export { modal };
export type { ModalProps, ModalInstance } from "./modal-types.js";
