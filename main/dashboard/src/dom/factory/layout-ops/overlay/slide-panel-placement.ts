import type { Instance } from "../../core/index.js";

const ATTR_HOST = "data-slide-panel-host";
const ATTR_ALIGN = "data-slide-panel-align";
const ALIGN_START = "start";
const ALIGN_CENTER = "center";
const ALIGN_END = "end";
const ALIGN_THIRD = 1 / 3;
const ALIGN_TWO_THIRDS = 2 / 3;

function findComponent(rootEl: HTMLElement): HTMLElement | null {
    const immediate = rootEl.parentElement;
    if (immediate === null) return null;
    let cur: HTMLElement | null = immediate;
    while (cur !== null) {
        if (cur.getAttribute(ATTR_HOST) === "true") return cur;
        cur = cur.parentElement;
    }
    return immediate;
}

function alignmentFor(triggerEl: HTMLElement, component: HTMLElement): string {
    const tr = triggerEl.getBoundingClientRect();
    const cr = component.getBoundingClientRect();
    if (cr.width === 0) return ALIGN_CENTER;
    const center = tr.left + tr.width / 2;
    const relative = (center - cr.left) / cr.width;
    if (relative < ALIGN_THIRD) return ALIGN_START;
    if (relative > ALIGN_TWO_THIRDS) return ALIGN_END;
    return ALIGN_CENTER;
}

export function makeEnsurePanel(root: Instance, panel: Instance, trigger: Instance): () => void {
    return () => {
        const component = findComponent(root.el);
        if (component === null) {
            if (panel.el.parentElement !== root.el) root.el.appendChild(panel.el);
            return;
        }
        let branch: HTMLElement = root.el;
        while (branch.parentElement !== null && branch.parentElement !== component) {
            branch = branch.parentElement;
        }
        if (branch.parentElement !== component) {
            if (panel.el.parentElement !== root.el) root.el.appendChild(panel.el);
            return;
        }
        const after = branch.nextSibling;
        const alreadyPlaced = panel.el.parentElement === component && panel.el.previousSibling === branch;
        if (!alreadyPlaced) {
            if (after !== null) component.insertBefore(panel.el, after);
            else component.appendChild(panel.el);
        }
        panel.el.setAttribute(ATTR_ALIGN, alignmentFor(trigger.el, component));
    };
}
