import type { Instance } from "../../core/index.js";
import type { SlidePanelInstance, SlidePanelProps } from "./slide-panel-types.js";

const PANEL_OPEN_CLASS = "slide-panel__panel--open";
const ATTR_EXPANDED = "aria-expanded";

interface SlidePanelOps {
    open: () => void;
    close: () => void;
    toggle: () => void;
}

interface PanelOpsArgs {
    panel: Instance;
    trigger: Instance;
    openedRef: { v: boolean };
    bannerMode: boolean;
    ensurePanel: () => void;
    props: SlidePanelProps;
    instRef: { i: SlidePanelInstance | null };
}

export function buildPanelOps(a: PanelOpsArgs): SlidePanelOps {
    const { panel, trigger, openedRef, bannerMode, ensurePanel, props, instRef } = a;
    return {
        open: () => {
            if (openedRef.v) return;
            openedRef.v = true;
            if (bannerMode) ensurePanel();
            panel.el.classList.add(PANEL_OPEN_CLASS);
            trigger.el.setAttribute(ATTR_EXPANDED, "true");
            props.onOpen?.();
        },
        close: () => {
            if (!openedRef.v) return;
            openedRef.v = false;
            panel.el.classList.remove(PANEL_OPEN_CLASS);
            trigger.el.setAttribute(ATTR_EXPANDED, "false");
            props.onClose?.();
        },
        toggle: () => {
            if (openedRef.v) instRef.i?.close();
            else instRef.i?.open();
        },
    };
}
