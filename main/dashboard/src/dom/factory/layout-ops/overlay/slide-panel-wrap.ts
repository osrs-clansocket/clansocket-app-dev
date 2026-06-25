import { div } from "../structural/container.js";
import type { Instance } from "../../core/index.js";

const PANEL_CLASS = "slide-panel__panel";
const PANEL_INNER_CLASS = "slide-panel__inner";

export function wrapPanelInner(panel: Instance, panelClasses?: readonly string[]): void {
    panel.el.classList.add(PANEL_CLASS);
    if (panelClasses) for (const c of panelClasses) panel.el.classList.add(c);
    const inner = div({ classes: [PANEL_INNER_CLASS], context: null, meta: null });
    while (panel.el.firstChild !== null) inner.el.appendChild(panel.el.firstChild);
    panel.el.appendChild(inner.el);
}
