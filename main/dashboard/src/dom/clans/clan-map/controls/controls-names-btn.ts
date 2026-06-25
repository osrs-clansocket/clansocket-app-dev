import type { Signal } from "../../../factory/reactive/index.js";
import type { Instance } from "../../../factory/core";
import { MAP_NAMES_BTN_CLASS } from "../../../../shared/constants/clan/clan-map-constants.js";
import { toggleChip } from "./controls-toggle-chip.js";

export function namesButton(namesVisible$: Signal<boolean>): Instance<HTMLButtonElement> {
    return toggleChip({
        klass: MAP_NAMES_BTN_CLASS,
        signal$: namesVisible$,
        label: "names",
        context: "toggle name cards overlay",
    });
}
