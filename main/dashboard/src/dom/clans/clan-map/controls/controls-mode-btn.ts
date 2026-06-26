import { button, span } from "../../../factory/content-ops";
import { effect, type Signal } from "../../../factory/reactive/index.js";
import type { Instance } from "../../../factory/core";
import { MAP_MODE_BTN_CLASS } from "../../../../shared/constants/clan/clan-map-constants.js";
import { IS_ACTIVE_CLASS } from "../../../../shared/constants/state-modifier-constants.js";

export type ViewMode = "auto" | "manual";

export function modeButton(mode$: Signal<ViewMode>): Instance<HTMLButtonElement> {
    const labelSpan = span({ context: null, meta: null }, ["follow"]);
    const btn = button(
        {
            ariaLabel: "Toggle follow mode",
            variant: "chip",

            classes: [MAP_MODE_BTN_CLASS],
            onClick: () => mode$.set(mode$() === "auto" ? "manual" : "auto"),
            context: "toggle follow blips",
            meta: ["action"],
        },
        [labelSpan],
    );
    btn.trackDispose(
        effect(() => {
            const isAuto = mode$() === "auto";
            btn.el.classList.toggle(IS_ACTIVE_CLASS, isAuto);
            labelSpan.setText(isAuto ? "follow" : "manual");
        }),
    );
    return btn;
}
