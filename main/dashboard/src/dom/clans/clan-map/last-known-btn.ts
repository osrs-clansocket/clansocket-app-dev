import type { Signal } from "../../factory/reactive/index.js";
import type { Instance } from "../../factory/core";
import { MAP_LAST_KNOWN_BTN_CLASS } from "../../../shared/constants/clan/clan-map-constants.js";
import { toggleChip } from "./controls/controls-toggle-chip.js";

export function lastKnownButton(lastKnownVisible$: Signal<boolean>): Instance<HTMLButtonElement> {
    return toggleChip({
        klass: MAP_LAST_KNOWN_BTN_CLASS,
        signal$: lastKnownVisible$,
        label: "last known",
        context: "toggle last-known blips for disconnected clannies",
    });
}
