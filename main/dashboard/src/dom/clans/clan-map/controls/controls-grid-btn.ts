import type { Signal } from "../../../factory/reactive/index.js";
import type { Instance } from "../../../factory/core";
import { MAP_GRID_BTN_CLASS } from "../../../../shared/constants/clan/clan-map-constants.js";
import { toggleChip } from "./controls-toggle-chip.js";

export function gridButton(gridVisible$: Signal<boolean>): Instance<HTMLButtonElement> {
    return toggleChip({
        klass: MAP_GRID_BTN_CLASS,
        signal$: gridVisible$,
        label: "grid",
        context: "toggle grid overlay",
    });
}
