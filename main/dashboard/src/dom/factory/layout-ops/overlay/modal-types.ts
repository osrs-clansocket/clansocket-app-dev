import type { ContextProps, Instance } from "../../core/index.js";

export interface ModalProps extends ContextProps {
    openClass: string;
    overlayClasses?: readonly string[];
    dialogClasses?: readonly string[];
    onClose?: () => void;
    closeOnBackdrop?: boolean;
    closeOnEscape?: boolean;
    initialFocus?: () => HTMLElement | null;
    restoreFocus?: boolean;
}

export interface ModalInstance extends Instance {
    open(): void;
    dismiss(): void;
    readonly dialogEl: HTMLElement;
}
