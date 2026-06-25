import type { ContextProps, Instance } from "../../core/index.js";

export interface SlidePanelProps extends ContextProps {
    rootClasses?: readonly string[];
    panelClasses?: readonly string[];
    onOpen?: () => void;
    onClose?: () => void;
    bannerMode?: boolean;
}

export interface SlidePanelInstance extends Instance {
    open(): void;
    close(): void;
    toggle(): void;
    isOpen(): boolean;
    readonly triggerEl: HTMLElement;
    readonly panelEl: HTMLElement;
}
