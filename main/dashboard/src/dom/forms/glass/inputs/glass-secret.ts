import { button, div, icon, span, type Instance, baseProps, textProps } from "../../../factory/index.js";

const CLASS_ROOT = "glass-secret";
const CLASS_REVEALED = "glass-secret--revealed";
const CLASS_VALUE = "glass-secret__value";
const CLASS_TOGGLE = "glass-secret__toggle";
const CLASS_ICON_WRAP = "glass-secret__icon";
const ICON_HIDDEN = "eye-slash";
const ICON_REVEALED = "eye";

function renderRevealIcon(wrap: Instance, isRevealed: boolean): void {
    wrap.clear();
    wrap.addChild(
        icon({
            provider: "bi",
            name: isRevealed ? ICON_REVEALED : ICON_HIDDEN,
            context: null,
            meta: null,
        }),
    );
}

function applyRevealState(toggle: Instance, iconWrap: Instance, isRevealed: boolean): void {
    toggle.setAttr("aria-label", isRevealed ? "hide" : "reveal");
    toggle.setAttr("title", isRevealed ? "hide" : "reveal");
    renderRevealIcon(iconWrap, isRevealed);
}

export function glassSecret(value: string): Instance {
    const valueEl = span(textProps([CLASS_VALUE], value));
    const iconWrap = span(baseProps([CLASS_ICON_WRAP]));
    renderRevealIcon(iconWrap, false);
    const root = div(baseProps([CLASS_ROOT]), [valueEl]);
    const toggle = button(
        {
            classes: [CLASS_TOGGLE],
            ariaLabel: "Reveal",
            title: "Reveal",
            type: "button",
            context: "reveal or hide the secret value",
            meta: ["action"],
            onClick: (e) => {
                e.stopPropagation();
                applyRevealState(toggle, iconWrap, root.el.classList.toggle(CLASS_REVEALED));
            },
        },
        [iconWrap],
    );
    root.addChild(toggle);
    return root;
}
