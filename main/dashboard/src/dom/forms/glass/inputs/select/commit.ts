import { wireClick, type Instance } from "../../../../factory/index.js";

const ATTR_SELECTED = "aria-selected";
const DATA_KEY_VALUE = "value";
const ATTR_VALUE = `data-${DATA_KEY_VALUE}`;

function commitSelection(
    opt: Instance<HTMLButtonElement>,
    siblings: readonly Instance<HTMLButtonElement>[],
    hidden: Instance<HTMLInputElement>,
    label: Instance,
): void {
    const value = opt.el.getAttribute(ATTR_VALUE);
    if (value === null) return;
    hidden.el.value = value;
    for (const o of siblings) {
        if (o.el.getAttribute(ATTR_VALUE) === value) o.setAttr(ATTR_SELECTED, "true");
        else o.removeAttr(ATTR_SELECTED);
    }
    label.setText(opt.el.textContent ?? value);
    hidden.el.dispatchEvent(new Event("change", { bubbles: true }));
}

export function wireSelectClicks(
    options: readonly Instance<HTMLButtonElement>[],
    hidden: Instance<HTMLInputElement>,
    label: Instance,
    closePanel: () => void,
): void {
    for (const opt of options) {
        wireClick(opt.el, () => {
            commitSelection(opt, options, hidden, label);
            closePanel();
        });
    }
}
