import type { Instance } from "../../core/index.js";
import { makeEnsurePanel } from "./slide-panel-placement.js";
import { wrapPanelInner } from "./slide-panel-wrap.js";
import { buildPanelRoot } from "./slide-panel-root.js";
import { buildPanelOps } from "./slide-panel-ops.js";
import type { SlidePanelInstance, SlidePanelProps } from "./slide-panel-types.js";

const ATTR_EXPANDED = "aria-expanded";
const EVT_CLICK = "click";

function slidePanel(props: SlidePanelProps, trigger: Instance, panel: Instance): SlidePanelInstance {
    wrapPanelInner(panel, props.panelClasses);
    const bannerMode = props.bannerMode === true;
    const root = buildPanelRoot(props, bannerMode, trigger, panel);
    const openedRef = { v: false };
    trigger.el.setAttribute(ATTR_EXPANDED, "false");
    const ensurePanel = makeEnsurePanel(root, panel, trigger);
    const instRef: { i: SlidePanelInstance | null } = { i: null };
    const ops = buildPanelOps({ panel, trigger, openedRef, bannerMode, ensurePanel, props, instRef });
    const inst: SlidePanelInstance = Object.assign(root, {
        triggerEl: trigger.el,
        panelEl: panel.el,
        isOpen: () => openedRef.v,
        ...ops,
    });
    instRef.i = inst;
    trigger.el.addEventListener(EVT_CLICK, () => inst.toggle());
    return inst;
}

export { slidePanel };
export type { SlidePanelProps, SlidePanelInstance } from "./slide-panel-types.js";
